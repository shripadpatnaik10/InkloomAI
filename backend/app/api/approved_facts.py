from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ApprovedFact
from app.schemas.schemas import ApprovedFactCreate, ApprovedFactRead, ApprovedFactUpdate

router = APIRouter(prefix="/api/v1/approved-facts", tags=["approved-facts"])

@router.get("", response_model=list[ApprovedFactRead])
def list_facts(db: Session = Depends(get_db)):
    return db.query(ApprovedFact).order_by(ApprovedFact.created_at.desc()).all()

@router.post("", response_model=ApprovedFactRead, status_code=201)
def create_fact(payload: ApprovedFactCreate, db: Session = Depends(get_db)):
    fact = ApprovedFact(**payload.model_dump())
    db.add(fact)
    db.commit()
    db.refresh(fact)
    return fact

@router.get("/{fact_id}", response_model=ApprovedFactRead)
def get_fact(fact_id: str, db: Session = Depends(get_db)):
    fact = db.get(ApprovedFact, fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Approved fact not found")
    return fact

@router.patch("/{fact_id}", response_model=ApprovedFactRead)
def update_fact(fact_id: str, payload: ApprovedFactUpdate, db: Session = Depends(get_db)):
    fact = db.get(ApprovedFact, fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Approved fact not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(fact, key, value)
    db.commit()
    db.refresh(fact)
    return fact

@router.delete("/{fact_id}", status_code=204)
def delete_fact(fact_id: str, db: Session = Depends(get_db)):
    fact = db.get(ApprovedFact, fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Approved fact not found")
    db.delete(fact)
    db.commit()