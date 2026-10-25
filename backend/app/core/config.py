import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

class Settings:
    app_name = "Inkloom AI"
    app_env = os.getenv("APP_ENV", "development")
    database_url = os.getenv("DATABASE_URL", "postgresql+psycopg://inkloom:inkloom@localhost:5432/inkloom")
    cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
    secret_key = os.getenv("SECRET_KEY", "development-only-change-me")
    seed_demo_users = os.getenv("SEED_DEMO_USERS", "false").lower() in {"1", "true", "yes"}
    seed_demo_data = os.getenv("SEED_DEMO_DATA", "false").lower() in {"1", "true", "yes"}
    demo_password = os.getenv("DEMO_PASSWORD", "demo-password-change-me")

    ai_enabled = os.getenv("AI_ENABLED", "false").lower() in {"1", "true", "yes"}
    ai_provider = os.getenv("AI_PROVIDER", "xai")
    ai_model = os.getenv("AI_MODEL", "grok-3-mini")
    xai_api_key = os.getenv("XAI_API_KEY", "")
    xai_base_url = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")
    ai_request_timeout = int(os.getenv("AI_REQUEST_TIMEOUT", "30"))
    ai_max_retries = int(os.getenv("AI_MAX_RETRIES", "2"))
    ai_max_input_characters = int(os.getenv("AI_MAX_INPUT_CHARACTERS", "12000"))
    ai_max_output_tokens = int(os.getenv("AI_MAX_OUTPUT_TOKENS", "2000"))

settings = Settings()