from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_is_real_and_versioned():
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "simeony-control-plane"
    assert payload["version"]


def test_capabilities_report_source_and_do_not_assume_gpu():
    response = client.get("/api/v1/system/capabilities")
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "local-host"
    assert payload["capabilities"]["gpu"]["status"] == "not_probed"
    assert payload["capabilities"]["gpu"]["devices"] == []


def test_integrations_use_explicit_states():
    response = client.get("/api/v1/integrations")
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["configured"] == len(payload["items"])
    assert all(item["state"] in {"available", "unavailable"} for item in payload["items"])
