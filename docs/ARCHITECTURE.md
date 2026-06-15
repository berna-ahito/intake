# Architecture

Intake consists of a FastAPI backend and a React/Vite frontend.

## Backend
- **FastAPI**: Handles RESTful API requests.
- **SQLAlchemy/SQLite**: ORM and local database for storing submissions, extracted fields, and audit logs.
- **Pydantic**: Data validation and serialization.
- **AI Service**: Currently uses a `MockProvider` to simulate extracting structured data (company, contact, industry, budget) from messy unstructured text. Includes confidence scores.
- **CRM Service**: Simulates syncing approved lead records to external CRMs.

## Frontend
- **React/Vite**: Fast, modern frontend framework.
- **Tailwind CSS**: Utility-first CSS framework for clean, responsive design.

## Data Flow
1. Messy submissions (text, emails) are sent to the backend.
2. The AI Service parses the unstructured text and returns a structured record with confidence scores.
3. The extracted record is saved in a "Pending" status.
4. A human reviewer uses the frontend to inspect the extracted data, make corrections, and approve the record.
5. The approved record can be simulated to sync to a CRM.
6. All steps are tracked in an Audit Log.

## Backend Contract Notes
- Final submission endpoints live under `/api/submissions` without requiring trailing slashes.
- Human approval is explicit through `POST /api/submissions/{submission_id}/approve`; extraction and review do not auto-approve.
- Review corrections are saved through `PATCH /api/submissions/{submission_id}/review`.
- Simulated CRM sync uses `POST /api/submissions/{submission_id}/crm-sync` and persists `crm_id`, `crm_sync_status`, `crm_synced_at`, and `crm_sync_error`.
- AI extraction, CRM sync, auth, document ingestion, and notifications are mocked, simulated, or planned until later phases.
