# Security

- **Secrets**: No secrets should be checked into version control. Use `.env` files (see `.env.example`).
- **Validation**: All incoming API requests are strictly validated using Pydantic.
- **File Uploads**: Uploaded document ingestion is planned but not shipped in this MVP. Current demo data focuses on pasted messy lead text and may include fake attachment metadata inside the text only; there is no real file upload pipeline yet.
- **Audit Logs**: Every critical action (submission creation, AI extraction, human review, CRM sync) is logged with a timestamp and action type.
