# Intake AI - Frontend

Phase 2 frontend UI integration for the Intake AI project.

## Features

- **Dashboard**: High-level overview of total submissions, pending review, approved, synced, and average AI extraction confidence.
- **Submissions List**: Filterable table of all incoming messy lead submissions.
- **New Submission Form**: Paste raw content (email thread, notes, form data) to start the intake process.
- **Submission Detail (Review UI)**: The core human-in-the-loop interface. View raw content side-by-side with mock AI-extracted fields. Review missing info, confidence scores, and duplicate risks. Run mock extraction, save corrections, and explicitly approve records before simulated CRM sync.
- **CRM Pipeline**: A kanban-style view showing records that need review, are approved, or have been successfully synced to the simulated CRM.
- **Audit Logs**: Every detail view includes an audit trail of actions taken on the submission.

## Architecture & Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4, `lucide-react` for icons
- **Data Fetching**: Custom fetch wrapper (`src/api/client.ts`)

## Running Locally

1. Make sure the FastAPI backend is running on `http://127.0.0.1:8000`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Production Build

For the portfolio deployment, Vite builds static files into `frontend/dist`:

```bash
npm run build
```

The FastAPI backend serves that built folder in production. Local development should still use the Vite dev server and the backend API separately.

## Integrations

- All AI extractions are currently **simulated** by the backend mock provider.
- CRM synchronization is **simulated**.
- Duplicate detection is currently a risk signal, not a full matching engine.
- Uploaded document ingestion is planned and is not implemented in this phase.
- Auth is not implemented as a real authentication system in this phase.
- Notifications are planned or stubbed and are not wired to email, Slack, or other channels.
- There are no real OAuth, Slack, email, CRM, file upload, or AI provider integrations in this phase.
