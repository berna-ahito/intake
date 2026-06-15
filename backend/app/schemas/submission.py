from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime


class SubmissionSource(str, Enum):
    EMAIL = "email"
    FORM = "form"
    PARTNER_REFERRAL = "partner_referral"
    CSV_IMPORT = "csv_import"
    WEBHOOK = "webhook"
    OTHER = "other"


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    NEEDS_REVIEW = "needs_review"
    APPROVED = "approved"
    CRM_READY = "crm_ready"
    SYNCED = "synced"


class CrmSyncStatus(str, Enum):
    NOT_SYNCED = "not_synced"
    SYNCED = "synced"
    FAILED = "failed"


class ReviewActionName(str, Enum):
    SAVE_CORRECTIONS = "save_corrections"
    NEEDS_REVIEW = "needs_review"


class SubmissionCreate(BaseModel):
    source: SubmissionSource
    raw_content: str = Field(..., min_length=1)

    @field_validator("raw_content")
    @classmethod
    def raw_content_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("raw_content must not be empty")
        return value

class ExtractedData(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    lead_source: Optional[str] = None
    requested_service: Optional[str] = None
    estimated_budget: Optional[str] = None
    urgency: Optional[str] = None
    notes: Optional[str] = None
    missing_fields: List[str] = Field(default_factory=list)

class SubmissionResponse(BaseModel):
    id: int
    source: SubmissionSource
    raw_content: str
    status: SubmissionStatus
    extracted_data: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = None
    duplicate_risk: Optional[float] = None
    crm_id: Optional[str] = None
    crm_sync_status: CrmSyncStatus
    crm_synced_at: Optional[datetime] = None
    crm_sync_error: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class ReviewAction(BaseModel):
    action: ReviewActionName
    corrected_data: Optional[Dict[str, Any]] = None
