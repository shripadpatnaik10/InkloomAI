from app.core.config import settings
from app.services.ai.xai import XAIProvider


def get_ai_provider():
    if not settings.ai_enabled:
        return None
    if settings.ai_provider.lower() != "xai":
        raise ValueError(f"Unsupported AI provider: {settings.ai_provider}")
    if not settings.xai_api_key:
        return None
    return XAIProvider(
        api_key=settings.xai_api_key,
        base_url=settings.xai_base_url,
        model=settings.ai_model,
        timeout=settings.ai_request_timeout,
        max_retries=settings.ai_max_retries,
    )