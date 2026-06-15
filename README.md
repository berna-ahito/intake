# Intake

The problem this solves:
Inbound leads and partner deal submissions often arrive through email, forms, spreadsheets, and partner handoffs. Sales teams waste time copying data into CRMs, checking for missing information, spotting duplicates, and deciding whether the lead is ready for follow-up. Intake centralizes that workflow. Uploaded document ingestion is planned but not implemented yet.

How it works:
Intake is an AI lead intake and CRM review system. It turns messy lead emails, forms, and partner referrals into structured CRM-ready records with confidence scores, duplicate risk signals, missing-info detection, human review, simulated CRM sync, and audit logs. A reviewer can see messy submissions become structured lead records, inspect what mock AI extracted, correct uncertain fields, approve the record, and simulate syncing it to a CRM pipeline.

Features:
- Submissions API for ingesting raw leads from supported sources
- Mock AI extraction mapping messy text to structured fields
- Confidence scoring for extracted fields
- Human-in-the-loop review workflow (approve or mark for review)
- Simulated CRM sync capability
- Comprehensive audit logging of all actions

Stable backend API contract:
- `GET /api/health`
- `POST /api/submissions`
- `GET /api/submissions`
- `GET /api/submissions/{submission_id}`
- `POST /api/submissions/{submission_id}/extract`
- `PATCH /api/submissions/{submission_id}/review`
- `POST /api/submissions/{submission_id}/approve`
- `POST /api/submissions/{submission_id}/crm-sync`
- `GET /api/submissions/{submission_id}/audit`

Current mocked behavior and Phase 1 limitations:
- AI extraction is mocked by default through `MockProvider`.
- CRM sync is simulated and persists simulated sync metadata.
- Duplicate detection is currently a risk signal, not a full matching engine.
- Uploaded document ingestion is planned and is not implemented yet.
- Auth is not implemented as a real authentication system yet.
- Notifications are planned or stubbed and are not wired to email, Slack, or other channels.

Stack:
- Backend: FastAPI, SQLAlchemy, Pydantic, SQLite (development)
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Testing: Pytest (Backend)

Try the demo:
1. Run the backend server
2. Run the frontend dev server
3. Navigate to the UI to see seeded lead submissions and test the review pipeline

Security:
- No real secrets are committed to the repository (see `.env.example`).
- Pydantic models are used for strict input validation.
- Every AI extraction, human review, and CRM sync action is recorded in the audit log.

Tests:
- Backend tests are provided via Pytest. Run `pytest` in the `backend` directory.

Project structure:
- `backend/app/`: Backend application code (FastAPI, database models, services)
- `backend/tests/`: Backend test suite
- `frontend/`: React frontend application
- `docs/`: Project architecture, security, and demo scripts
