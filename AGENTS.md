# Agent Guidelines

This document outlines guidelines for AI coding agents working on the Intake project.

- Maintain the "portfolio-grade" nature of this project. Code should be clean, well-tested, and documented.
- No fake overclaiming. If an integration is mocked (like the AI provider or CRM sync), it must be clearly labeled as a simulation.
- Humans must approve final CRM-ready records. The AI should never auto-approve a record.
- Follow the existing stack: FastAPI, SQLAlchemy, Pydantic, React, Vite, Tailwind CSS.
- Ensure all API inputs are validated using Pydantic.
- Ensure all review actions and extractions are logged in the audit trail.
