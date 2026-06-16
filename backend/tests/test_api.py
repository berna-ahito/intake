import os

os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.config import Settings
from app.db.schema import ensure_sqlite_contract_columns
from app.db.session import Base, get_db
from seed import seeds


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def create_submission(source="email", raw_content="Jane from Acme. Email jane@example.com. Call 555-0199."):
    response = client.post(
        "/api/submissions",
        json={"source": source, "raw_content": raw_content},
    )
    assert response.status_code == 200
    return response.json()


def extract_submission(submission_id):
    response = client.post(f"/api/submissions/{submission_id}/extract")
    assert response.status_code == 200
    return response.json()


def approve_submission(submission_id):
    response = client.post(f"/api/submissions/{submission_id}/approve")
    assert response.status_code == 200
    return response.json()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_development_cors_origins_keep_local_vite_when_env_adds_origin(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("CORS_ORIGINS", "https://intake.example.com")

    configured = Settings()

    assert configured.cors_origins == [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://intake.example.com",
    ]


@pytest.mark.parametrize("origin", ["http://localhost:5173", "http://127.0.0.1:5173"])
def test_submissions_endpoint_allows_local_frontend_origins(origin):
    response = client.get("/api/submissions", headers={"Origin": origin})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_sqlite_contract_rewrites_legacy_source_values_for_cors_response():
    with engine.begin() as connection:
        connection.exec_driver_sql(
            """
            INSERT INTO submissions (source, raw_content, status, crm_sync_status, created_at)
            VALUES ('partner', 'Legacy partner lead', 'pending', 'not_synced', CURRENT_TIMESTAMP)
            """
        )
        connection.exec_driver_sql(
            """
            INSERT INTO submissions (source, raw_content, status, crm_sync_status, created_at)
            VALUES ('upload', 'Legacy uploaded lead text', 'pending', 'not_synced', CURRENT_TIMESTAMP)
            """
        )

    ensure_sqlite_contract_columns(engine)

    response = client.get("/api/submissions", headers={"Origin": "http://localhost:5173"})
    sources = {submission["source"] for submission in response.json()}

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert {"partner_referral", "csv_import"}.issubset(sources)


def test_create_submission_rejects_empty_raw_content():
    response = client.post("/api/submissions", json={"source": "email", "raw_content": "   "})
    assert response.status_code == 422


@pytest.mark.parametrize("source", ["email", "form", "partner_referral", "csv_import", "webhook", "other"])
def test_valid_source_values_work(source):
    submission = create_submission(source=source)
    assert submission["source"] == source
    assert submission["status"] == "pending"
    assert submission["crm_sync_status"] == "not_synced"


def test_seed_source_values_match_api_contract():
    for seed in seeds:
        submission = create_submission(
            source=seed["source"],
            raw_content=seed["raw_content"],
        )
        assert submission["source"] == seed["source"]


def test_invalid_source_value_fails():
    response = client.post(
        "/api/submissions",
        json={"source": "fax", "raw_content": "Jane from Acme"},
    )
    assert response.status_code == 422


def test_final_submission_routes_have_no_required_trailing_slash():
    submission = create_submission()

    list_response = client.get("/api/submissions")
    detail_response = client.get(f"/api/submissions/{submission['id']}")

    assert list_response.status_code == 200
    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == submission["id"]


def test_extraction_creates_audit_entry_and_does_not_auto_approve():
    submission = create_submission()

    extracted = extract_submission(submission["id"])
    audit_response = client.get(f"/api/submissions/{submission['id']}/audit")

    assert extracted["status"] == "needs_review"
    assert extracted["confidence_score"] is not None
    assert extracted["extracted_data"]["missing_fields"] == []
    assert any(entry["action"] == "extracted" for entry in audit_response.json())


def test_extraction_produces_confidence_and_missing_field_information():
    submission = create_submission(raw_content="Jane from Acme. Email jane@example.com.")

    extracted = extract_submission(submission["id"])

    assert 0 <= extracted["confidence_score"] <= 1
    assert "phone" in extracted["extracted_data"]["missing_fields"]


def test_cannot_approve_before_extraction():
    submission = create_submission()

    response = client.post(f"/api/submissions/{submission['id']}/approve")

    assert response.status_code == 409
    assert "extract" in response.json()["detail"].lower()


def test_review_corrections_can_be_saved_without_approval():
    submission = create_submission()
    extract_submission(submission["id"])

    response = client.patch(
        f"/api/submissions/{submission['id']}/review",
        json={
            "action": "save_corrections",
            "corrected_data": {
                "company_name": "Acme Global",
                "contact_name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "555-0199",
                "missing_fields": [],
            },
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "needs_review"
    assert data["extracted_data"]["company_name"] == "Acme Global"


def test_approve_after_extraction_works():
    submission = create_submission()
    extract_submission(submission["id"])

    approved = approve_submission(submission["id"])

    assert approved["status"] == "approved"


def test_cannot_sync_before_approval():
    submission = create_submission()
    extract_submission(submission["id"])

    response = client.post(f"/api/submissions/{submission['id']}/crm-sync")

    assert response.status_code == 409
    assert "approved" in response.json()["detail"].lower()


def test_crm_sync_after_approval_persists_metadata():
    submission = create_submission()
    extract_submission(submission["id"])
    approve_submission(submission["id"])

    sync_response = client.post(f"/api/submissions/{submission['id']}/crm-sync")
    detail_response = client.get(f"/api/submissions/{submission['id']}")

    assert sync_response.status_code == 200
    synced = sync_response.json()
    reloaded = detail_response.json()
    assert synced["status"] == "synced"
    assert synced["crm_id"] == f"CRM-LEAD-{submission['id']}"
    assert synced["crm_sync_status"] == "synced"
    assert synced["crm_synced_at"] is not None
    assert reloaded["crm_id"] == synced["crm_id"]
    assert reloaded["crm_sync_status"] == "synced"


def test_synced_submissions_cannot_regress_to_earlier_states():
    submission = create_submission()
    extract_submission(submission["id"])
    approve_submission(submission["id"])
    sync_response = client.post(f"/api/submissions/{submission['id']}/crm-sync")
    assert sync_response.status_code == 200

    review_response = client.patch(
        f"/api/submissions/{submission['id']}/review",
        json={"action": "needs_review"},
    )
    extract_response = client.post(f"/api/submissions/{submission['id']}/extract")
    approve_response = client.post(f"/api/submissions/{submission['id']}/approve")

    assert review_response.status_code == 409
    assert extract_response.status_code == 409
    assert approve_response.status_code == 409


@pytest.mark.parametrize(
    "method,path",
    [
        ("get", "/api/submissions/999"),
        ("post", "/api/submissions/999/extract"),
        ("patch", "/api/submissions/999/review"),
        ("post", "/api/submissions/999/approve"),
        ("post", "/api/submissions/999/crm-sync"),
        ("get", "/api/submissions/999/audit"),
    ],
)
def test_missing_submission_id_returns_404(method, path):
    if method == "patch":
        response = client.patch(path, json={"action": "needs_review"})
    else:
        response = getattr(client, method)(path)
    assert response.status_code == 404


def test_duplicate_risk_behavior():
    submission = create_submission(raw_content="This may be a duplicate lead from Acme. Email jane@example.com.")

    extracted = extract_submission(submission["id"])

    assert extracted["duplicate_risk"] == 0.95
