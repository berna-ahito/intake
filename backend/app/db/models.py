from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from sqlalchemy.sql import func
from app.db.session import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)
    raw_content = Column(Text, nullable=False)
    status = Column(String, default="pending")
    extracted_data = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    duplicate_risk = Column(Float, nullable=True)
    crm_id = Column(String, nullable=True)
    crm_sync_status = Column(String, nullable=False, default="not_synced")
    crm_synced_at = Column(DateTime(timezone=True), nullable=True)
    crm_sync_error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, index=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
