from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import AuditLog, Submission
from app.schemas.audit import AuditLogResponse
from app.schemas.submission import (
    CrmSyncStatus,
    ReviewAction,
    ReviewActionName,
    SubmissionCreate,
    SubmissionResponse,
    SubmissionStatus,
)
from app.services.ai_service import ai_service
from app.services.crm_service import simulate_crm_sync


router = APIRouter()


def get_submission_or_404(db: Session, submission_id: int) -> Submission:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


def add_audit(db: Session, submission_id: int, action: str, details: Optional[str] = None) -> None:
    db.add(AuditLog(submission_id=submission_id, action=action, details=details))


def reject_if_synced(submission: Submission) -> None:
    if submission.status == SubmissionStatus.SYNCED.value:
        raise HTTPException(status_code=409, detail="Synced submissions cannot be changed")


def reject_without_extraction(submission: Submission, action: str) -> None:
    if not submission.extracted_data:
        raise HTTPException(status_code=409, detail=f"Cannot {action} before extraction")


def commit_or_rollback(db: Session) -> None:
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


@router.post("", response_model=SubmissionResponse)
@router.post("/", response_model=SubmissionResponse, include_in_schema=False)
def create_submission(submission_in: SubmissionCreate, db: Session = Depends(get_db)):
    db_obj = Submission(
        source=submission_in.source.value,
        raw_content=submission_in.raw_content,
        status=SubmissionStatus.PENDING.value,
        crm_sync_status=CrmSyncStatus.NOT_SYNCED.value,
    )
    db.add(db_obj)
    db.flush()
    add_audit(db, db_obj.id, "created", f"Source: {db_obj.source}")
    commit_or_rollback(db)
    db.refresh(db_obj)
    return db_obj


@router.get("", response_model=List[SubmissionResponse])
@router.get("/", response_model=List[SubmissionResponse], include_in_schema=False)
def list_submissions(db: Session = Depends(get_db)):
    return db.query(Submission).order_by(Submission.created_at.desc()).all()


@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    return get_submission_or_404(db, submission_id)


@router.post("/{submission_id}/extract", response_model=SubmissionResponse)
def run_extraction(submission_id: int, db: Session = Depends(get_db)):
    db_obj = get_submission_or_404(db, submission_id)
    reject_if_synced(db_obj)

    ai_result = ai_service.extract_fields(db_obj.raw_content)
    db_obj.extracted_data = ai_result["extracted_data"]
    db_obj.confidence_score = ai_result["confidence_score"]
    db_obj.duplicate_risk = ai_result["duplicate_risk"]
    db_obj.status = SubmissionStatus.NEEDS_REVIEW.value

    add_audit(db, db_obj.id, "extracted", f"Confidence: {db_obj.confidence_score}")
    commit_or_rollback(db)
    db.refresh(db_obj)
    return db_obj


@router.patch("/{submission_id}/review", response_model=SubmissionResponse)
def review_submission(submission_id: int, action: ReviewAction, db: Session = Depends(get_db)):
    db_obj = get_submission_or_404(db, submission_id)
    reject_if_synced(db_obj)
    reject_without_extraction(db_obj, "review")

    if action.corrected_data is not None:
        db_obj.extracted_data = action.corrected_data

    if action.action == ReviewActionName.NEEDS_REVIEW:
        db_obj.status = SubmissionStatus.NEEDS_REVIEW.value
        details = "Marked as needs review"
    else:
        details = "Corrections saved"

    if action.corrected_data is not None:
        details = f"{details}; manual corrections saved"

    add_audit(db, db_obj.id, "reviewed", details)
    commit_or_rollback(db)
    db.refresh(db_obj)
    return db_obj


@router.post("/{submission_id}/approve", response_model=SubmissionResponse)
def approve_submission(submission_id: int, db: Session = Depends(get_db)):
    db_obj = get_submission_or_404(db, submission_id)
    reject_if_synced(db_obj)
    reject_without_extraction(db_obj, "approve")

    db_obj.status = SubmissionStatus.APPROVED.value
    add_audit(db, db_obj.id, "approved", "Human approval recorded")
    commit_or_rollback(db)
    db.refresh(db_obj)
    return db_obj


@router.post("/{submission_id}/crm-sync", response_model=SubmissionResponse)
def sync_submission(submission_id: int, db: Session = Depends(get_db)):
    db_obj = get_submission_or_404(db, submission_id)
    reject_if_synced(db_obj)

    if not db_obj.extracted_data:
        raise HTTPException(status_code=409, detail="Cannot sync without extracted data")

    allowed_statuses = {SubmissionStatus.APPROVED.value, SubmissionStatus.CRM_READY.value}
    if db_obj.status not in allowed_statuses:
        raise HTTPException(
            status_code=409,
            detail="Cannot sync unless submission is approved or CRM-ready",
        )

    try:
        result = simulate_crm_sync(db_obj.id, db_obj.extracted_data)
        db_obj.crm_id = result["crm_id"]
        db_obj.crm_sync_status = CrmSyncStatus.SYNCED.value
        db_obj.crm_synced_at = datetime.now(timezone.utc)
        db_obj.crm_sync_error = None
        db_obj.status = SubmissionStatus.SYNCED.value
        add_audit(db, db_obj.id, "crm_synced", f"Simulated CRM sync: {db_obj.crm_id}")
        commit_or_rollback(db)
    except Exception as exc:
        db.rollback()
        db_obj = get_submission_or_404(db, submission_id)
        db_obj.crm_sync_status = CrmSyncStatus.FAILED.value
        db_obj.crm_sync_error = str(exc)
        add_audit(db, db_obj.id, "crm_sync_failed", str(exc))
        commit_or_rollback(db)
        raise HTTPException(status_code=502, detail="Simulated CRM sync failed") from exc

    db.refresh(db_obj)
    return db_obj


@router.get("/{submission_id}/audit", response_model=List[AuditLogResponse])
def get_submission_audit(submission_id: int, db: Session = Depends(get_db)):
    get_submission_or_404(db, submission_id)
    return (
        db.query(AuditLog)
        .filter(AuditLog.submission_id == submission_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )


@router.post("/{submission_id}/sync", response_model=SubmissionResponse, include_in_schema=False)
def sync_submission_legacy(submission_id: int, db: Session = Depends(get_db)):
    return sync_submission(submission_id, db)
