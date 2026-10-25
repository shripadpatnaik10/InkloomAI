from fastapi import APIRouter

from app.core.config import settings
from app.schemas.schemas import AIStatusRead

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

@router.get("/status", response_model=AIStatusRead)
def ai_status():
    configured = bool(settings.xai_api_key) if settings.ai_provider.lower() == "xai" else False
    mode = "real_ai" if settings.ai_enabled and configured else "demo"
    return AIStatusRead(
        enabled=settings.ai_enabled,
        provider=settings.ai_provider,
        model=settings.ai_model,
        credentials_configured=configured,
        mode=mode,
    )