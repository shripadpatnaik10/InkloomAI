from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class AISeverity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class AICategory(str, Enum):
    voice = "voice"
    terminology = "terminology"
    facts = "facts"
    claims = "claims"
    visual = "visual"
    accessibility = "accessibility"


class AIFinding(BaseModel):
    rule_id: Optional[str] = None
    category: AICategory
    severity: AISeverity
    issue_title: str = Field(min_length=1, max_length=200)
    original_excerpt: str = Field(min_length=1, max_length=500)
    explanation: str = Field(min_length=1, max_length=2000)
    suggested_correction: Optional[str] = Field(default=None, max_length=1000)
    evidence: str = Field(min_length=1, max_length=2000)
    confidence: float = Field(ge=0, le=1)


class AIAnalysisResult(BaseModel):
    summary: str = Field(min_length=1, max_length=2000)
    findings: list[AIFinding] = Field(default_factory=list)
    evaluated_categories: list[str] = Field(default_factory=list)
    unevaluated_categories: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)