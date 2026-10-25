from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class UserRole(str, Enum):
    admin = "admin"
    reviewer = "reviewer"
    creator = "creator"
    viewer = "viewer"


class RuleCategory(str, Enum):
    voice = "voice"
    terminology = "terminology"
    facts = "facts"
    claims = "claims"
    visual = "visual"
    accessibility = "accessibility"


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class RuleStatus(str, Enum):
    active = "active"
    inactive = "inactive"


class ContentType(str, Enum):
    social = "social"
    blog = "blog"
    ad = "ad"
    email = "email"
    website = "website"
    other = "other"


class FindingStatus(str, Enum):
    open = "open"
    accepted = "accepted"
    dismissed = "dismissed"
    resolved = "resolved"


class ApprovalStatus(str, Enum):
    draft = "draft"
    submitted = "submitted"
    in_review = "in_review"
    changes_requested = "changes_requested"
    resubmitted = "resubmitted"
    approved = "approved"
    rejected = "rejected"
    reopened = "reopened"


class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.creator
    password: Optional[str] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class BrandRuleCreate(BaseModel):
    name: str
    category: RuleCategory
    description: str
    rule_text: Optional[str] = None
    severity: Severity = Severity.medium
    status: RuleStatus = RuleStatus.active


class BrandRuleUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[RuleCategory] = None
    description: Optional[str] = None
    rule_text: Optional[str] = None
    severity: Optional[Severity] = None
    status: Optional[RuleStatus] = None


class BrandRuleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: RuleCategory
    description: str
    rule_text: Optional[str]
    severity: Severity
    status: RuleStatus
    created_at: datetime
    updated_at: datetime


class ApprovedFactCreate(BaseModel):
    name: str
    content: str
    source_reference: Optional[str] = None
    status: RuleStatus = RuleStatus.active


class ApprovedFactUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    source_reference: Optional[str] = None
    status: Optional[RuleStatus] = None


class ApprovedFactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    content: str
    source_reference: Optional[str]
    status: RuleStatus
    created_at: datetime
    updated_at: datetime


class ContentCreate(BaseModel):
    title: str
    content_type: ContentType = ContentType.other
    content: str
    created_by: str


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[ContentType] = None
    content: Optional[str] = None


class ContentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    content_type: ContentType
    current_content: str
    created_by_id: str
    current_revision_number: int
    created_at: datetime
    updated_at: datetime


class ContentRevisionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content_item_id: str
    revision_number: int
    content_snapshot: str
    created_by_id: str
    created_at: datetime


class FindingCreate(BaseModel):
    category: RuleCategory
    severity: Severity
    original_excerpt: str
    explanation: str
    suggested_correction: Optional[str] = None
    brand_rule_id: Optional[str] = None
    status: FindingStatus = FindingStatus.open


class FindingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    review_id: str
    brand_rule_id: Optional[str]
    category: RuleCategory
    severity: Severity
    original_excerpt: str
    explanation: str
    suggested_correction: Optional[str]
    status: FindingStatus
    created_at: datetime
    updated_at: datetime


class ReviewCreate(BaseModel):
    content_item_id: str
    created_by: str
    analysis_type: str = "simulated"
    score: Optional[int] = None
    findings: list[FindingCreate] = Field(default_factory=list)


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content_item_id: str
    content_revision_id: str
    analysis_type: str
    analysis_mode: str
    model_name: Optional[str]
    request_id: Optional[str]
    score: Optional[int]
    status: str
    analyzed_at: datetime
    created_by_id: str
    findings: list[FindingRead] = Field(default_factory=list)

class AIStatusRead(BaseModel):
    enabled: bool
    provider: str
    model: str
    credentials_configured: bool
    mode: str

class CorrectionRequest(BaseModel):
    finding_id: str
    original_excerpt: str
    suggested_context: Optional[str] = None

class CorrectionRead(BaseModel):
    suggested_correction: str
    rationale: str


class ApprovalCreate(BaseModel):
    content_item_id: str
    content_revision_id: str
    submitted_by: str
    assigned_reviewer: Optional[str] = None


class ApprovalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    content_item_id: str
    content_revision_id: str
    submitted_by_id: str
    assigned_reviewer_id: Optional[str]
    status: ApprovalStatus
    submitted_at: datetime
    updated_at: datetime


class ApprovalDecisionCreate(BaseModel):
    reviewer_id: str
    decision: str
    reason: Optional[str] = None


class ApprovalCommentCreate(BaseModel):
    author_id: str
    comment: str


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    actor_id: Optional[str]
    entity_type: str
    entity_id: str
    event_type: str
    details: dict[str, Any]
    created_at: datetime


class HealthResponse(BaseModel):
    status: str
    database: str = "unknown"