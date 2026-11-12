import pytest
from fastapi.testclient import TestClient

import src.db as db
from src.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db.DB_PATH = str(tmp_path / "test.db")

    def fake_interpret(text):
        return f"**Símbolos**\n- reflejo del texto\n\n**Mensaje**\nCalma. ({text[:4]})"

    monkeypatch.setattr("src.main.llm.interpret", fake_interpret)
    return TestClient(app)


def test_flujo_completo(client):
    r = client.post("/api/dreams", json={"text": "Soñé con un gato azul volando"})
    assert r.status_code == 201
    dream = r.json()
    assert dream["text"] == "Soñé con un gato azul volando"
    assert "Símbolos" in dream["interpretation"]

    assert client.get(f"/api/dreams/{dream['id']}").json()["id"] == dream["id"]
    assert client.get("/api/dreams").json()[0]["id"] == dream["id"]

    r = client.post(f"/api/dreams/{dream['id']}/interpret")
    assert r.status_code == 200
    assert "Símbolos" in r.json()["interpretation"]

    assert client.delete(f"/api/dreams/{dream['id']}").status_code == 204
    assert client.get(f"/api/dreams/{dream['id']}").status_code == 404


def test_sueno_vacio_rechazado(client):
    assert client.post("/api/dreams", json={"text": "   "}).status_code == 400