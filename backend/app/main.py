from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.activity import router as activity_router
from app.api.ai import router as ai_router
from app.api.auth import router as auth_router
from app.api.approvals import router as approvals_router
from app.api.approved_facts import router as approved_facts_router
from app.api.brand_rules import router as brand_rules_router
from app.api.content import router as content_router
from app.api.health import router as health_router
from app.api.reviews import router as reviews_router
from app.api.scorecard import router as scorecard_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.seed import seed_demo_data
from app.models.models import User, UserRole
from app.core.security import hash_password

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_demo_data()
    if settings.seed_demo_users:
        try:
            if db.query(User).count() == 0:
                for name, email, role in [("Demo Creator", "creator@example.com", UserRole.creator), ("Demo Reviewer", "reviewer@example.com", UserRole.reviewer), ("Demo Admin", "admin@example.com", UserRole.admin)]:
                    db.add(User(name=name, email=email, role=role, password_hash=hash_password(settings.demo_password)))
                db.commit()
        finally:
            db.close()
    yield

app = FastAPI(title="Inkloom AI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(brand_rules_router)
app.include_router(approved_facts_router)
app.include_router(content_router)
app.include_router(reviews_router)
app.include_router(scorecard_router)
app.include_router(approvals_router)
app.include_router(activity_router)
app.include_router(auth_router)
app.include_router(ai_router)