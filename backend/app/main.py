from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine, Base
from app.routers import health, submissions, audit


def ensure_sqlite_contract_columns():
    if engine.dialect.name != "sqlite":
        return

    columns = {
        "crm_id": "crm_id VARCHAR",
        "crm_sync_status": "crm_sync_status VARCHAR NOT NULL DEFAULT 'not_synced'",
        "crm_synced_at": "crm_synced_at DATETIME",
        "crm_sync_error": "crm_sync_error VARCHAR",
    }

    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(submissions)").fetchall()
        }
        for column_name, ddl in columns.items():
            if column_name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE submissions ADD COLUMN {ddl}")


# Create database tables
Base.metadata.create_all(bind=engine)
ensure_sqlite_contract_columns()

app = FastAPI(title=settings.PROJECT_NAME, redirect_slashes=False)
app.router.redirect_slashes = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])

@app.get("/")
def root():
    return {"message": "Welcome to Intake API"}
