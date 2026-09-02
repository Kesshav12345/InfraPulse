import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.init_db import init_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_db()

def test_login_success():
    response = client.post("/api/auth/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/api/auth/login", data={"username": "admin", "password": "wrong"})
    assert response.status_code == 401

def test_get_me():
    login_response = client.post("/api/auth/login", data={"username": "engineer", "password": "engineer"})
    token = login_response.json()["access_token"]
    
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user = response.json()
    assert user["username"] == "engineer"
    assert user["role"] == "ENGINEER"
    assert user["ministry"] == "Railways"
