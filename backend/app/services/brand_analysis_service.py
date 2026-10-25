import re
import uuid

from app.core.config import settings
from app.models.models import ApprovedFact, BrandRule, FindingStatus, RuleCategory, Severity
from app.services.ai.factory import get_ai_provider
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.schemas import AIAnalysisResult
from app.services.ai.validator import FindingValidator

WEIGHTS = {"critical": 25, "high": 15, "medium": 8, "low": 3}

POTENTIAL_CONCERN_PHRASES = [
    "eliminates all diseases",
    "increases your IQ by 50 points",
    "guarantees 100% results for everyone",
    "zero side effects",
    "you will never need to visit a hospital again",
]


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _phrase_regex(phrase: str) -> re.Pattern[str]:
    words = phrase.split()
    return re.compile(r"\b" + r"\W+".join(re.escape(word) for word in words) + r"\b", re.IGNORECASE)


def _find_occurrences(text: str, phrase: str) -> list[str]:
    return [match.group(0) for match in _phrase_regex(phrase).finditer(text)]


class BrandAnalysisService:
    def __init__(self, content: str, rules: list[BrandRule], facts: list[ApprovedFact] | None = None):
        self.content = content
        self.rules = rules
        self.facts = facts or []
        self.active_rules = [r for r in rules if r.status.value == "active"]
        self.active_facts = [f for f in self.facts if f.status.value == "active"]

    def _deterministic_findings(self) -> list[dict]:
        findings = []
        # Configured restricted phrases and terminology.
        for rule in self.active_rules:
            raw_rule_text = (rule.rule_text or "").strip()
            if not raw_rule_text:
                continue
            if "->" in raw_rule_text:
                phrase = raw_rule_text.split("->", 1)[0].strip()
                preferred = raw_rule_text.split("->", 1)[1].strip()
            else:
                phrase = raw_rule_text
                preferred = None
            for occurrence in _find_occurrences(self.content, phrase):
                suggested = preferred if preferred and rule.category == RuleCategory.terminology else None
                findings.append(
                    {
                        "brand_rule_id": rule.id,
                        "category": rule.category,
                        "severity": rule.severity,
                        "original_excerpt": occurrence,
                        "explanation": rule.description,
                        "suggested_correction": suggested,
                        "status": FindingStatus.open,
                    }
                )
        # Approved facts: price conflicts.
        price_facts = [f for f in self.active_facts if "price" in f.name.lower()]
        price_regex = re.compile(r"(?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d+)?", re.IGNORECASE)
        for match in price_regex.finditer(self.content):
            found_price = match.group(0)
            for fact in price_facts:
                normalized_found = re.sub(r"[^0-9.]", "", found_price)
                normalized_approved = re.sub(r"[^0-9.]", "", fact.content)
                if normalized_found and normalized_approved and normalized_found != normalized_approved:
                    findings.append(
                        {
                            "brand_rule_id": None,
                            "category": RuleCategory.facts,
                            "severity": Severity.high,
                            "original_excerpt": found_price,
                            "explanation": f"The content states {found_price}, which conflicts with the approved fact '{fact.name}' ({fact.content}).",
                            "suggested_correction": fact.content,
                            "status": FindingStatus.open,
                        }
                    )
        # Potential concerns without a configured rule.
        for phrase in POTENTIAL_CONCERN_PHRASES:
            for occurrence in _find_occurrences(self.content, phrase):
                if any(f["original_excerpt"].lower() == occurrence.lower() and f["category"] == RuleCategory.claims for f in findings):
                    continue
                findings.append(
                    {
                        "brand_rule_id": None,
                        "category": RuleCategory.claims,
                        "severity": Severity.high,
                        "original_excerpt": occurrence,
                        "explanation": "Potential concern requiring verification: this phrase makes an absolute or unsupported claim.",
                        "suggested_correction": "Verify with evidence or replace with an approved, evidence-backed claim.",
                        "status": FindingStatus.open,
                    }
                )
        return findings

    def _dedupe(self, findings: list[dict]) -> list[dict]:
        seen = set()
        result = []
        for finding in findings:
            category = finding["category"].value if hasattr(finding["category"], "value") else str(finding["category"])
            key = (category, _normalize(finding["original_excerpt"]))
            if key in seen:
                continue
            seen.add(key)
            result.append(finding)
        return result

    def run(self) -> dict:
        findings = self._deterministic_findings()
        mode = "demo"
        model_name = None
        request_id = str(uuid.uuid4())
        warnings: list[str] = []
        provider = get_ai_provider()
        if settings.ai_enabled and provider is not None:
            if len(self.content) > settings.ai_max_input_characters:
                warnings.append("Content exceeded the configured input limit and was truncated.")
                content = self.content[: settings.ai_max_input_characters]
            else:
                content = self.content
            try:
                system_prompt, user_prompt = PromptBuilder.build_analysis_prompt(content, self.active_rules)
                result: AIAnalysisResult = provider.analyze(system_prompt, user_prompt)
                validator = FindingValidator(content, self.active_rules)
                for ai_finding in result.findings:
                    validated = validator.validate(ai_finding)
                    if validated:
                        findings.append(validated)
                mode = "real_ai"
                model_name = provider.model_name
                warnings.extend(result.warnings)
                if result.unevaluated_categories:
                    warnings.append("Some categories were not evaluated: " + ", ".join(result.unevaluated_categories))
            except Exception as exc:
                warnings.append(f"AI analysis failed: {exc}")
                mode = "demo"
        else:
            warnings.append("AI is disabled or not configured. Using deterministic simulated analysis.")
        findings = self._dedupe(findings)
        score = 100
        for finding in findings:
            severity = finding["severity"].value if hasattr(finding["severity"], "value") else str(finding["severity"])
            score -= WEIGHTS.get(severity, 0)
        score = max(0, min(100, score))
        return {
            "score": score,
            "findings": findings,
            "mode": mode,
            "model_name": model_name,
            "request_id": request_id,
            "warnings": warnings,
        }