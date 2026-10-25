from sqlalchemy.orm import Session

from app.models.models import BrandRule, Finding, FindingStatus, Review, Severity


def run_simulated_analysis(db: Session, content: str, brand_rules: list[BrandRule]) -> tuple[int, list[dict]]:
    findings: list[dict] = []
    lowered = content.lower()
    for rule in brand_rules:
        if rule.status.value != "active":
            continue
        needle = (rule.rule_text or rule.description or "").strip().lower()
        if not needle:
            continue
        if needle in lowered:
            findings.append(
                {
                    "brand_rule_id": rule.id,
                    "category": rule.category,
                    "severity": rule.severity,
                    "original_excerpt": needle,
                    "explanation": rule.description,
                    "suggested_correction": None,
                    "status": FindingStatus.open,
                }
            )
    weights = {"critical": 25, "high": 15, "medium": 8, "low": 3}
    score = 100
    for finding in findings:
        score -= weights.get(finding["severity"].value if hasattr(finding["severity"], "value") else str(finding["severity"]), 0)
    score = max(0, min(100, score))
    return score, findings