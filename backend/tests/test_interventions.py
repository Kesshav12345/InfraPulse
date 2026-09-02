import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.init_db import init_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()

def get_token(username, password):
    res = client.post("/api/auth/login", data={"username": username, "password": password})
    return res.json()["access_token"]

def test_create_intervention():
    token = get_token("admin", "admin")
    response = client.post(
        "/api/interventions/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "project_code": "PROJ-1234",
            "warning_reference": "WARN-99",
            "priority": "HIGH",
            "evidence_summary": "Test evidence",
            "recommended_review_area": "Review costs"
        }
    )
    assert response.status_code == 200
    assert response.json()["project_code"] == "PROJ-1234"

def test_get_interventions_as_engineer():
    token = get_token("engineer", "engineer")
    response = client.get("/api/interventions/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    interventions = response.json()
    assert isinstance(interventions, list)
    # The engineer should only see interventions for their ministry's projects
    # Here we just check it returns a 200 and a list successfully.
