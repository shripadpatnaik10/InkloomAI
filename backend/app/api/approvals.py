from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ActivityEvent, ApprovalDecision, ApprovalStatus, ApprovalSubmission, ReviewerComment, User
from app.schemas.schemas import (
    ApprovalCommentCreate,
    ApprovalCreate,
    ApprovalDecisionCreate,
    ApprovalRead,
    ActivityRead,
)

router = APIRouter(prefix="/api/v1/approvals", tags=["approvals"])

TRANSITIONS = {
    "draft": {"submitted"},
    "submitted": {"in_review"},
    "in_review": {"changes_requested", "approved", "rejected"},
    "changes_requested": {"resubmitted"},
    "resubmitted": {"in_review"},
    "approved": {"reopened"},
    "rejected": {"reopened"},
    "reopened": {"in_review"},
}

def event(db, actor_id, entity_id, event_type, details):
    db.add(ActivityEvent(actor_id=actor_id, entity_type="approval_submission", entity_id=entity_id, event_type=event_type, details=details))

@router.get("", response_model=list[ApprovalRead])
def list_approvals(db: Session = Depends(get_db)):
    return db.query(ApprovalSubmission).order_by(ApprovalSubmission.updated_at.desc()).all()

@router.post("", response_model=ApprovalRead, status_code=201)
def create_approval(payload: ApprovalCreate, db: Session = Depends(get_db)):
    submission = ApprovalSubmission(
        content_item_id=payload.content_item_id,
        content_revision_id=payload.content_revision_id,
        submitted_by_id=payload.submitted_by,
        assigned_reviewer_id=payload.assigned_reviewer,
        status=ApprovalStatus.submitted,
    )
    db.add(submission)
    db.flush()
    event(db, payload.submitted_by, submission.id, "submitted", {"status": "submitted"})
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/{submission_id}", response_model=ApprovalRead)
def get_approval(submission_id: str, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@router.post("/{submission_id}/assign", response_model=ApprovalRead)
def assign_reviewer(submission_id: str, reviewer_id: str, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    reviewer = db.get(User, reviewer_id)
    if not reviewer:
        raise HTTPException(status_code=404, detail="Reviewer not found")
    submission.assigned_reviewer_id = reviewer_id
    event(db, reviewer_id, submission_id, "reviewer_assigned", {"reviewer_id": reviewer_id})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/start-review", response_model=ApprovalRead)
def start_review(submission_id: str, reviewer_id: str, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "in_review" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    submission.status = ApprovalStatus.in_review
    if submission.assigned_reviewer_id is None:
        submission.assigned_reviewer_id = reviewer_id
    event(db, reviewer_id, submission_id, "review_started", {})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/request-changes", response_model=ApprovalRead)
def request_changes(submission_id: str, payload: ApprovalDecisionCreate, db: Session = Depends(get_db)):
    if not payload.reason or not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Reason is required")
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "changes_requested" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    submission.status = ApprovalStatus.changes_requested
    db.add(ApprovalDecision(submission_id=submission_id, reviewer_id=payload.reviewer_id, decision="request-changes", reason=payload.reason))
    db.add(ReviewerComment(submission_id=submission_id, author_id=payload.reviewer_id, comment=payload.reason))
    event(db, payload.reviewer_id, submission_id, "changes_requested", {"reason": payload.reason})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/resubmit", response_model=ApprovalRead)
def resubmit(submission_id: str, submitted_by: str, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "resubmitted" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    submission.status = ApprovalStatus.resubmitted
    event(db, submitted_by, submission_id, "resubmitted", {})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/approve", response_model=ApprovalRead)
def approve(submission_id: str, payload: ApprovalDecisionCreate, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "approved" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    # latest review check
    from app.models.models import Review, Finding
    review = db.query(Review).filter_by(content_item_id=submission.content_item_id, content_revision_id=submission.content_revision_id).order_by(Review.analyzed_at.desc()).first()
    if review:
        critical = db.query(Finding).filter_by(review_id=review.id, severity="critical", status="open").count()
        if critical > 0:
            raise HTTPException(status_code=400, detail="Approval blocked by unresolved critical findings")
    submission.status = ApprovalStatus.approved
    db.add(ApprovalDecision(submission_id=submission_id, reviewer_id=payload.reviewer_id, decision="approve", reason=payload.reason))
    event(db, payload.reviewer_id, submission_id, "approved", {})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/reject", response_model=ApprovalRead)
def reject(submission_id: str, payload: ApprovalDecisionCreate, db: Session = Depends(get_db)):
    if not payload.reason or not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Reason is required")
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "rejected" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    submission.status = ApprovalStatus.rejected
    db.add(ApprovalDecision(submission_id=submission_id, reviewer_id=payload.reviewer_id, decision="reject", reason=payload.reason))
    event(db, payload.reviewer_id, submission_id, "rejected", {"reason": payload.reason})
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/{submission_id}/reopen", response_model=ApprovalRead)
def reopen(submission_id: str, actor_id: str, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if "reopened" not in TRANSITIONS.get(submission.status.value, set()):
        raise HTTPException(status_code=400, detail="Invalid transition")
    submission.status = ApprovalStatus.reopened
    event(db, actor_id, submission_id, "reopened", {})
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/{submission_id}/activity", response_model=list[ActivityRead])
def activity(submission_id: str, db: Session = Depends(get_db)):
    return db.query(ActivityEvent).filter_by(entity_type="approval_submission", entity_id=submission_id).order_by(ActivityEvent.created_at.desc()).all()

@router.post("/{submission_id}/comments", response_model=ApprovalRead)
def add_comment(submission_id: str, payload: ApprovalCommentCreate, db: Session = Depends(get_db)):
    submission = db.get(ApprovalSubmission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.add(ReviewerComment(submission_id=submission_id, author_id=payload.author_id, comment=payload.comment))
    event(db, payload.author_id, submission_id, "comment_added", {"comment": payload.comment})
    db.commit()
    db.refresh(submission)
    return submission