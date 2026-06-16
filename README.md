<p align="center">
  <img src="docs/assets/intake-header.svg" alt="Intake product header" width="100%">
</p>

<h1 align="center">Intake</h1>
<h2 align="center">Turn messy lead submissions into structured CRM-ready records.</h2>

<p align="center">
  Intake is an AI lead intake and CRM review system. It helps teams turn messy lead emails, form submissions, and partner referrals into structured CRM-ready records. The current demo uses mock AI extraction, duplicate risk signals, human review, simulated CRM sync, and audit logging.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/backend_tests-passing-slate" alt="Backend tests passing">
  <img src="https://img.shields.io/badge/frontend_tests-passing-slate" alt="Frontend tests passing">
  <img src="https://img.shields.io/badge/AI-mocked-cyan" alt="AI mocked">
  <img src="https://img.shields.io/badge/CRM-simulated-cyan" alt="CRM simulated">
</p>

<p align="center">
  <a href="https://intake-aykt.onrender.com">Live Demo</a> ┬╖ <a href="#core-features">Features</a> ┬╖ <a href="docs/ARCHITECTURE.md">Architecture</a> ┬╖ <a href="#stable-api-contract">API</a> ┬╖ <a href="#local-development">Run Locally</a> ┬╖ <a href="#portfolio-deployment">Deployment</a>
</p>

<hr>

## The problem this solves

Inbound leads often arrive messy. Sales teams lose time copying details into CRMs, checking missing information, spotting possible duplicates, and deciding whether a lead is ready for follow-up. Intake gives that review workflow one place to live.

## How Intake works

* A lead comes in as messy text.
* The reviewer runs mock extraction.
* The app shows extracted fields, confidence signals, missing information, and duplicate risk.
* A human reviewer corrects or approves the record.
* Approved records can be sent through simulated CRM sync.
* Every important action is saved in the audit log.

## Core features

| Feature | Description |
| --- | --- |
| Lead submission intake | Receives messy lead text for processing. |
| Mock AI extraction | Converts messy text into structured fields. |
| Confidence and missing-info review | Shows confidence signals and highlights missing information. |
| Duplicate risk signal | Surfaces possible duplicates using a risk signal. |
| Human review workflow | Lets a human reviewer correct or approve records. |
| Simulated CRM sync | Pushes approved records through simulated CRM sync. |
| Audit log | Saves extraction, review, correction, approval, and sync actions. |
| React review dashboard | Provides a single place for the review workflow. |

## What is implemented, mocked, and planned

| Status | Feature |
| --- | --- |
| **Implemented** | lead submission API, pasted messy lead text, mock extraction workflow, confidence signal, missing-info review, duplicate risk signal, human correction and approval, simulated CRM sync metadata, audit log, React frontend, local SQLite development database, Postgres-ready `DATABASE_URL` configuration, Render deployment setup |
| **Mocked or simulated** | AI extraction, CRM sync, duplicate detection as a risk signal |
| **Planned, not shipped** | real AI provider, real CRM integration, uploaded document ingestion, real authentication, email or Slack notifications |

## Demo flow

1. Start the application.
2. Open the frontend dashboard to see messy lead submissions.
3. Click a submission to view the raw text.
4. Run mock extraction to see structured fields.
5. Review the confidence signal, missing information, and duplicate risk signal.
6. Make a human correction if needed.
7. Approve the record to mark it as CRM-ready.
8. Click Simulated CRM sync to simulate pushing the record to an external pipeline.
9. View the audit log for extraction, correction, approval, and sync actions.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite locally, Postgres through `DATABASE_URL` for deployment |
| Frontend | React, TypeScript, Tailwind CSS |
| Testing | Pytest, Node test runner |
| Deployment | Render web service, Neon Postgres |

## Stable API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/submissions` | Create a lead submission |
| `GET` | `/api/submissions` | List submissions |
| `GET` | `/api/submissions/{submission_id}` | Get one submission |
| `POST` | `/api/submissions/{submission_id}/extract` | Run mock extraction |
| `PATCH` | `/api/submissions/{submission_id}/review` | Save human correction or mark for review |
| `POST` | `/api/submissions/{submission_id}/approve` | Approve a reviewed record |
| `POST` | `/api/submissions/{submission_id}/crm-sync` | Simulated CRM sync |
| `GET` | `/api/submissions/{submission_id}/audit` | View audit log for a submission |

## Local development

Start the backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Local frontend development calls the backend separately.

## Portfolio deployment

* Live demo is deployed on Render.
* Database uses external Postgres through `DATABASE_URL`.
* FastAPI serves the built React frontend for non-API routes.
* API routes stay under `/api`.
* `/api/health` is the health check endpoint.
* `VITE_API_BASE_URL` should be set to the deployed app origin before frontend build.
* `CORS_ORIGINS` should match the deployed app origin.
* Do not commit secrets.

## Security notes

* No real secrets committed.
* Environment values stay in local `.env` files or deployment provider settings.
* Pydantic validates input.
* Audit log records mock extraction, review, approval, and simulated sync actions.
* This MVP does not include real authentication yet.

## Tests

Run backend tests from the backend directory:

```bash
cd backend
python -m pytest
```

Run frontend tests from the frontend directory:

```bash
cd frontend
npm test
```

## Project structure

| Path | Purpose |
| --- | --- |
| `backend/app/` | FastAPI backend, database models, routers, schemas, and services |
| `backend/tests/` | Backend test suite |
| `frontend/` | React frontend application |
| `docs/` | Architecture, security notes, case study, and demo script |
| `render.yaml` | Render single-service deployment configuration |
