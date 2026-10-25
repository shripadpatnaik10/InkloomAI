from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ContentItem, ContentRevision, User, UserRole
from app.schemas.schemas import ContentCreate, ContentRead, ContentRevisionRead, ContentUpdate

router = APIRouter(prefix="/api/v1/content", tags=["content"])

@router.get("", response_model=list[ContentRead])
def list_content(db: Session = Depends(get_db)):
    return db.query(ContentItem).order_by(ContentItem.created_at.desc()).all()

@router.post("", response_model=ContentRead, status_code=201)
def create_content(payload: ContentCreate, db: Session = Depends(get_db)):
    user = db.get(User, payload.created_by)
    if not user:
        user = User(id=payload.created_by, name="Demo Creator", email=f"{payload.created_by}@example.com", role=UserRole.creator)
        db.add(user)
        db.flush()
    item = ContentItem(
        title=payload.title,
        content_type=payload.content_type,
        current_content=payload.content,
        created_by_id=payload.created_by,
        current_revision_number=1,
    )
    db.add(item)
    db.flush()
    revision = ContentRevision(
        content_item_id=item.id,
        revision_number=1,
        content_snapshot=payload.content,
        created_by_id=payload.created_by,
    )
    db.add(revision)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{content_id}", response_model=ContentRead)
def get_content(content_id: str, db: Session = Depends(get_db)):
    item = db.get(ContentItem, content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    return item

@router.patch("/{content_id}", response_model=ContentRead)
def update_content(content_id: str, payload: ContentUpdate, db: Session = Depends(get_db)):
    item = db.get(ContentItem, content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    if payload.title is not None:
        item.title = payload.title
    if payload.content_type is not None:
        item.content_type = payload.content_type
    if payload.content is not None and payload.content != item.current_content:
        item.current_revision_number += 1
        item.current_content = payload.content
        revision = ContentRevision(
            content_item_id=item.id,
            revision_number=item.current_revision_number,
            content_snapshot=payload.content,
            created_by_id=item.created_by_id,
        )
        db.add(revision)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{content_id}/revisions", response_model=list[ContentRevisionRead])
def list_revisions(content_id: str, db: Session = Depends(get_db)):
    item = db.get(ContentItem, content_id)
    if not item:
        raise HTTPException(status_code=404, detail="Content not found")
    return db.query(ContentRevision).filter_by(content_item_id=content_id).order_by(ContentRevision.revision_number).all()