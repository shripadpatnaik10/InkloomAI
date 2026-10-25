from typing import Protocol

from app.services.ai.schemas import AIAnalysisResult


class AIProvider(Protocol):
    provider_name: str
    model_name: str

    def analyze(self, system_prompt: str, user_prompt: str) -> AIAnalysisResult: ...

    def suggest_correction(self, system_prompt: str, user_prompt: str) -> str: ...