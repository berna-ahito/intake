<img src="docs/assets/intake-header.svg" alt="Intake AI lead intake and CRM review system" width="100%">

# Intake

Turn messy lead submissions into structured CRM-ready records.

Intake is an AI lead intake and CRM review system. It receives unstructured inbound leads from forms, emails, or partner submissions and processes them into structured records. The system features mock AI extraction with confidence scores, duplicate risk signals, a missing-info review process, human approval, simulated CRM sync, and an audit log.

![Backend Tests](https://img.shields.io/badge/backend_tests-passing-blue)
![Frontend Tests](https://img.shields.io/badge/frontend_tests-passing-blue)
![Mock AI](https://img.shields.io/badge/AI-mocked-orange)
![Simulated CRM](https://img.shields.io/badge/CRM-simulated-orange)

## The problem this solves

Inbound leads and partner deal submissions often arrive through messy text, emails, or forms. Sales teams waste time copying data into CRMs, checking for missing information, spotting duplicates, and deciding whether the lead is ready for follow-up. Intake centralizes that workflow.

## How Intake works

A reviewer can watch messy submissions become structured lead records. The system uses a mock AI provider to extract fields, correct uncertain fields via human-in-the-loop review, approve the record, and simulate syncing it to a CRM pipeline. Every action is recorded in an audit log.

## Core features

* Submissions API for ingesting raw leads from supported sources
* Mock AI extraction mapping messy text to structured fields
* Confidence scoring for extracted fields
* Human-in-the-loop review workflow
* Simulated CRM sync capability
* Comprehensive audit logging of all actions

## What is implemented, mocked, and planned

| Status | Feature |
| --- | --- |
| **Implemented** | lead submission API, pasted messy lead text, mock AI extraction workflow, confidence score, missing-info review, duplicate risk signal, human correction and approval, simulated CRM sync metadata, audit log, React frontend, local SQLite development database, Postgres-ready DATABASE_URL configuration |
| **Mocked or simulated** | AI extraction, CRM sync, duplicate detection as a risk signal |
| **Planned, not shipped** | real AI provider, real CRM integration, uploaded document ingestion, real authentication, email or Slack notifications |

## Demo flow

1. Start the application by running the backend and frontend separately.
2. Open the frontend dashboard to see the seeded lead submissions.
3. Click on a messy lead submission to view the raw text and the mock AI-extracted fields.
4. Note the confidence scores assigned to fields like budget or industry.
5. Make a manual correction to an uncertain field during human review.
6. Click Approve to mark the lead as CRM-ready.
7. Click Simulated CRM sync to simulate pushing the record to an external pipeline.
8. View the audit trail detailing the extraction, correction, and sync events.

## Tech stack

* Backend: FastAPI, SQLAlchemy, Pydantic, SQLite
* Frontend: React, TypeScript, Tailwind CSS
* Testing: Pytest for backend, Node test runner for the frontend API client

## Stable API contract

* `GET /api/health`
* `POST /api/submissions`
* `GET /api/submissions`
* `GET /api/submissions/{submission_id}`
* `POST /api/submissions/{submission_id}/extract`
* `PATCH /api/submissions/{submission_id}/review`
* `POST /api/submissions/{submission_id}/approve`
* `POST /api/submissions/{submission_id}/crm-sync`
* `GET /api/submissions/{submission_id}/audit`

## Local development

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Local frontend development calls the backend API separately.

## Portfolio deployment

The repository includes `render.yaml` for one Render web service.
Render installs backend dependencies, installs frontend dependencies, builds `frontend/dist`, and starts FastAPI.
In production, FastAPI serves the built React frontend for non-API routes and keeps API routes under `/api`.
Use `/api/health` as the health check path.
A persistent deployed demo should use Postgres through `DATABASE_URL`.
Do not commit secrets.

## Security notes

No real secrets are committed to the repository.
Pydantic models are used for strict input validation.
Every AI extraction, human review, and CRM sync action is recorded in the audit log.

## Tests

Backend tests are provided via Pytest. Run them in the backend directory:

```bash
cd backend
python -m pytest
```

Frontend tests run in the frontend directory:

```bash
cd frontend
npm test
```

## Project structure

* `backend/app/`: Backend application code (FastAPI, database models, services)
* `backend/tests/`: Backend test suite
* `frontend/`: React frontend application
* `docs/`: Project architecture, security, and demo scripts
