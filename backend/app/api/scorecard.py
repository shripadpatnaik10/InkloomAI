from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Finding, Review

router = APIRouter(prefix="/api/v1/scorecard", tags=["scorecard"])

@router.get("/summary")
def scorecard_summary(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()
    if not reviews:
        return {"average_score": 0, "total_reviews": 0, "reviews_with_critical": 0, "open_findings": 0}
    unresolved = db.query(Finding).filter(Finding.status.in_(["open", "accepted"])).all()
    critical_reviews = {f.review_id for f in unresolved if f.severity.value == "critical"}
    return {
        "average_score": round(sum(r.score or 0 for r in reviews) / len(reviews)),
        "total_reviews": len(reviews),
        "reviews_with_critical": len(critical_reviews),
        "open_findings": len(unresolved),
    }

@router.get("/categories")
def scorecard_categories(db: Session = Depends(get_db)):
    findings = db.query(Finding).all()
    counts: dict[str, int] = {}
    for finding in findings:
        counts[finding.category.value] = counts.get(finding.category.value, 0) + 1
    return [{"category": category, "findings": count} for category, count in counts.items()]

@router.get("/trends")
def scorecard_trends(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.analyzed_at).all()
    return [{"date": r.analyzed_at.isoformat(), "score": r.score} for r in reviews]