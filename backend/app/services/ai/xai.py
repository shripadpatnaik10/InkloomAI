import json
import time

import httpx

from app.core.config import settings
from app.services.ai.schemas import AIAnalysisResult


class XAIProvider:
    def __init__(self, api_key: str, base_url: str, model: str, timeout: int, max_retries: int):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model_name = model
        self.provider_name = "xai"
        self.timeout = timeout
        self.max_retries = max_retries

    def _post(self, payload: dict) -> dict:
        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                response = httpx.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                    json=payload,
                    timeout=self.timeout,
                )
                if response.status_code == 429 or response.status_code >= 500:
                    last_error = RuntimeError(f"Provider returned status {response.status_code}")
                    time.sleep(min(2 ** attempt, 5))
                    continue
                response.raise_for_status()
                return response.json()
            except httpx.TimeoutException as exc:
                last_error = exc
                time.sleep(min(2 ** attempt, 5))
            except httpx.HTTPError as exc:
                last_error = exc
                break
        raise RuntimeError("AI provider request failed") from last_error

    def analyze(self, system_prompt: str, user_prompt: str) -> AIAnalysisResult:
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "max_tokens": settings.ai_max_output_tokens,
            "temperature": 0.1,
        }
        data = self._post(payload)
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return AIAnalysisResult.model_validate(parsed)

    def suggest_correction(self, system_prompt: str, user_prompt: str) -> str:
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "max_tokens": 500,
            "temperature": 0.2,
        }
        data = self._post(payload)
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return str(parsed.get("suggested_correction", "")).strip()