from app.models.models import BrandRule, FindingStatus, RuleCategory, Severity
from app.services.ai.schemas import AICategory, AIFinding, AISeverity


class FindingValidator:
    def __init__(self, content: str, rules: list[BrandRule]):
        self.content = content
        self.lower_content = content.lower()
        self.rules_by_id = {rule.id: rule for rule in rules}
        self.allowed_rule_ids = set(self.rules_by_id)

    def validate(self, finding: AIFinding) -> dict | None:
        if finding.rule_id is not None and finding.rule_id not in self.allowed_rule_ids:
            return None
        if finding.original_excerpt not in self.content:
            if finding.original_excerpt.lower() not in self.lower_content:
                return None
        rule = self.rules_by_id.get(finding.rule_id) if finding.rule_id else None
        if rule is not None and rule.category.value != finding.category.value:
            return None
        return {
            "brand_rule_id": finding.rule_id,
            "category": RuleCategory(finding.category.value),
            "severity": Severity(finding.severity.value),
            "original_excerpt": finding.original_excerpt,
            "explanation": finding.explanation,
            "suggested_correction": finding.suggested_correction,
            "status": FindingStatus.open,
        }