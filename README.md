<p align="center">
  <img src="docs/assets/intake-header.svg" alt="Intake product header" width="100%">
</p>

<h1 align="center">Intake</h1>

<h2 align="center">Turn messy lead submissions into structured CRM-ready records.</h2>

<p align="center">
  Intake is an AI lead intake and CRM review system. It receives unstructured inbound leads from forms, emails, or partner submissions and processes them into structured records. The system features mock AI extraction with a confidence score, duplicate risk signals, human review, simulated CRM sync, and an audit log.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/backend_tests-passing-slate" alt="Backend tests passing">
  <img src="https://img.shields.io/badge/frontend_tests-passing-slate" alt="Frontend tests passing">
  <img src="https://img.shields.io/badge/AI-mocked-cyan" alt="AI mocked">
  <img src="https://img.shields.io/badge/CRM-simulated-cyan" alt="CRM simulated">
</p>

<hr>

## Live demo

Live demo: https://intake-aykt.onrender.com

The Render free service may take a short moment to wake up if it has been inactive.

## The problem this solves

Inbound leads and partner deal submissions often arrive through messy text, emails, or forms. Sales teams waste time copying data into CRMs, checking for missing information, spotting duplicates, and deciding whether the lead is ready for follow-up. Intake centralizes that workflow.

## How Intake works

A reviewer can watch messy submissions become structured lead records. The system uses a mock AI provider to extract fields, supports human correction for uncertain fields, approves records only after review, and simulates syncing approved leads to a CRM pipeline. Every action is recorded in an audit log.

## Core features

| Feature | What it does |
| --- | --- |
| Lead submission intake | Stores messy inbound lead text from supported sources such as forms, emails, partner referrals, webhooks, and CSV-style imports. |
| Mock AI extraction | Converts messy text into structured lead fields for review. |
| Confidence and missing-info review | Shows a confidence score and highlights information that needs human attention. |
| Duplicate risk signal | Surfaces a risk indicator for possible duplicate leads without claiming full duplicate matching. |
| Human review workflow | Lets a reviewer correct extracted fields, mark records for review, or approve records for CRM readiness. |
| Simulated CRM sync | Persists simulated CRM sync metadata without calling a real CRM. |
| Audit log | Records extraction, review, approval, and simulated sync actions. |

## What is implemented, mocked, and planned

| Status | Feature |
| --- | --- |
| **Implemented** | lead submission API, pasted messy lead text, mock AI extraction workflow, confidence score, missing-info review, duplicate risk signal, human correction and approval, simulated CRM sync metadata, audit log, React frontend, local SQLite development database, Postgres-ready `DATABASE_URL` configuration |
| **Mocked or simulated** | AI extraction, CRM sync, duplicate detection as a risk signal |
| **Planned, not shipped** | real AI provider, real CRM integration, uploaded document ingestion, real authentication, email or Slack notifications |

## Demo flow

1. Open the live demo or run the backend and frontend locally.
2. Create a sample lead or open a seeded local submission.
3. Click on a messy lead submission to view the raw text and the mock AI-extracted fields.
4. Review the confidence score, missing information, and duplicate risk signal.
5. Make a manual correction to an uncertain field during human review.
6. Approve the record to mark it as CRM-ready.
7. Click Simulated CRM sync to simulate pushing the record to an external pipeline.
8. View the audit trail for the extraction, correction, approval, and sync events.

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite for local development, Postgres-ready through `DATABASE_URL` |
| Frontend | React, TypeScript, Tailwind CSS |
| Testing | Pytest for backend, Node test runner for frontend API client |
| Deployment | Render single-service configuration with external Postgres |

## Stable API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/submissions` | Create a lead submission |
| `GET` | `/api/submissions` | List submissions |
| `GET` | `/api/submissions/{submission_id}` | Get one submission |
| `POST` | `/api/submissions/{submission_id}/extract` | Run mock extraction |
| `PATCH` | `/api/submissions/{submission_id}/review` | Save reviewer corrections or mark for review |
| `POST` | `/api/submissions/{submission_id}/approve` | Approve a reviewed record |
| `POST` | `/api/submissions/{submission_id}/crm-sync` | Simulate CRM sync |
| `GET` | `/api/submissions/{submission_id}/audit` | View audit events for a submission |

## Local development

Start the backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
