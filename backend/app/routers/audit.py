from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import AuditLog, Submission
from app.schemas.audit import AuditLogResponse

router = APIRouter()


@router.get("/{submission_id}", response_model=List[AuditLogResponse])
def get_audit_logs(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return db.query(AuditLog).filter(AuditLog.submission_id == submission_id).order_by(AuditLog.created_at.desc()).all()
