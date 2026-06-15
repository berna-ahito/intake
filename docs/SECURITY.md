# Security

- **Secrets**: No secrets should be checked into version control. Use `.env` files (see `.env.example`).
- **Validation**: All incoming API requests are strictly validated using Pydantic.
- **File Uploads**: While file uploads are basic in v1, future iterations must enforce strict file size limits and type checking.
- **Audit Logs**: Every critical action (submission creation, AI extraction, human review, CRM sync) is logged with a timestamp and action type.
