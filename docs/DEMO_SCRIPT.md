# Demo Script

1. **Start the Application**: Spin up the backend (`uvicorn app.main:app --reload`) and frontend (`npm run dev`).
2. **View Dashboard**: Open the frontend to see the seeded lead submissions.
3. **Inspect a Messy Lead**: Click on an unstructured email submission to see the raw text alongside the AI-extracted fields.
4. **Note the Confidence Scores**: Point out how the AI assigned confidence scores to fields like "budget" or "industry".
5. **Human Review**: Make a manual correction to an uncertain field.
6. **Approve**: Click "Approve" to mark the lead as CRM-ready.
7. **CRM Sync**: Click "Sync to CRM" to simulate pushing the record to an external pipeline.
8. **View Audit Log**: Show the audit trail detailing the extraction, correction, and sync events.
