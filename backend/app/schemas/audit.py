from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AuditLogResponse(BaseModel):
    id: int
    submission_id: int
    action: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
