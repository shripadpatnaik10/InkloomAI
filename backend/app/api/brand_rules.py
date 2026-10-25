from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import require_role
from app.db.session import get_db
from app.models.models import BrandRule, UserRole
from app.schemas.schemas import BrandRuleCreate, BrandRuleRead, BrandRuleUpdate

router = APIRouter(prefix="/api/v1/brand-rules", tags=["brand-rules"])

@router.get("", response_model=list[BrandRuleRead])
def list_brand_rules(db: Session = Depends(get_db)):
    return db.query(BrandRule).order_by(BrandRule.created_at.desc()).all()

@router.post("", response_model=BrandRuleRead, status_code=201)
def create_brand_rule(payload: BrandRuleCreate, db: Session = Depends(get_db), user=Depends(require_role(UserRole.admin))):
    rule = BrandRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/{rule_id}", response_model=BrandRuleRead)
def get_brand_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = db.get(BrandRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Brand rule not found")
    return rule

@router.patch("/{rule_id}", response_model=BrandRuleRead)
def update_brand_rule(rule_id: str, payload: BrandRuleUpdate, db: Session = Depends(get_db), user=Depends(require_role(UserRole.admin))):
    rule = db.get(BrandRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Brand rule not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}", status_code=204)
def delete_brand_rule(rule_id: str, db: Session = Depends(get_db), user=Depends(require_role(UserRole.admin))):
    rule = db.get(BrandRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Brand rule not found")
    db.delete(rule)
    db.commit()