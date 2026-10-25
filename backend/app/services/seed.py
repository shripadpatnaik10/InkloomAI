from app.core.config import settings
from app.db.session import SessionLocal
from app.models.models import ApprovedFact, BrandRule, RuleCategory, RuleStatus, Severity


def seed_demo_data() -> None:
    if not settings.seed_demo_data:
        return
    db = SessionLocal()
    try:
        if db.query(BrandRule).count() == 0:
            db.add_all([
                BrandRule(name="Brand voice and tone", category=RuleCategory.voice, description="Brand tone must be professional, friendly, and trustworthy.", rule_text=None, severity=Severity.medium, status=RuleStatus.active),
                BrandRule(name="Approved customer terminology", category=RuleCategory.terminology, description="Use 'customers' rather than 'users' in customer-facing campaigns.", rule_text="users -> customers", severity=Severity.medium, status=RuleStatus.active),
                BrandRule(name="Unsupported guarantees prohibited", category=RuleCategory.claims, description="Unsupported guarantees are prohibited in promotional content.", rule_text="guaranteed", severity=Severity.critical, status=RuleStatus.active),
                BrandRule(name="Promotional statistics require a source", category=RuleCategory.claims, description="Promotional statistics must cite an approved source.", rule_text="increases your IQ by 50 points", severity=Severity.high, status=RuleStatus.active),
            ])
        if db.query(ApprovedFact).count() == 0:
            db.add(ApprovedFact(name="Approved product price", content="₹1,499", source_reference="Product Catalog (demo)", status=RuleStatus.active))
        db.commit()
    finally:
        db.close()