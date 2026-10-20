import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
API_KEY = "dev-ai-service-key"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "KrishiSetu" in data["service"]
    assert "ollama" in data["models"]

def test_recommend_crop_without_auth():
    payload = {
        "nitrogen": 100,
        "phosphorus": 50,
        "potassium": 50,
        "temperature": 27.0,
        "humidity": 65.0,
        "ph": 6.8,
        "rainfall": 800.0
    }
    response = client.post("/api/v1/recommend-crop", json=payload)
    assert response.status_code == 403

def test_recommend_crop_with_auth():
    payload = {
        "nitrogen": 110,
        "phosphorus": 45,
        "potassium": 50,
        "temperature": 28.0,
        "humidity": 65.0,
        "ph": 7.0,
        "rainfall": 750.0
    }
    response = client.post(
        "/api/v1/recommend-crop",
        json=payload,
        headers={"x-api-key": API_KEY}
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    assert data["recommendations"][0]["confidence"] > 0

def test_chat_rag_assistant():
    payload = {"question": "How to plant sugarcane in Maharashtra?"}
    response = client.post(
        "/api/v1/chat",
        json=payload,
        headers={"x-api-key": API_KEY}
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["sources"]) > 0

def test_ollama_status_endpoint():
    response = client.get(
        "/api/v1/ollama/status",
        headers={"x-api-key": API_KEY}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "ollama"
    assert "status" in data
    assert "endpoint" in data
