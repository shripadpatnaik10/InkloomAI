from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(tags=["health"])

@router.get("/health")
def health():
    return {"status": "ok", "database": "not-checked"}

@router.get("/api/v1/health")
def api_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        database = "error"
    return {"status": "ok", "database": database}