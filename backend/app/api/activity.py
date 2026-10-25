from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ActivityEvent
from app.schemas.schemas import ActivityRead

router = APIRouter(prefix="/api/v1/activity", tags=["activity"])

@router.get("", response_model=list[ActivityRead])
def list_activity(db: Session = Depends(get_db)):
    return db.query(ActivityEvent).order_by(ActivityEvent.created_at.desc()).limit(100).all()