from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine, Base
from app.db.schema import ensure_sqlite_contract_columns
from app.routers import health, submissions, audit

FRONTEND_DIST_DIR = Path(__file__).resolve().parents[2] / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"


# Create database tables
Base.metadata.create_all(bind=engine)
ensure_sqlite_contract_columns(engine)

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

if FRONTEND_INDEX.exists():
    assets_dir = FRONTEND_DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")

        requested_path = FRONTEND_DIST_DIR / full_path
        if requested_path.is_file():
            return FileResponse(requested_path)

        return FileResponse(FRONTEND_INDEX)
else:
    @app.get("/")
    def root():
        return {"message": "Welcome to Intake API"}
