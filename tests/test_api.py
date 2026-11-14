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


def test_llm_caido_guarda_sueno_sin_interpretacion(client, monkeypatch, caplog):
    def falla(text):
        raise OSError("LLM no disponible")

    monkeypatch.setattr("src.main.llm.interpret", falla)
    with caplog.at_level("WARNING", logger="src.main"):
        r = client.post("/api/dreams", json={"text": "Soñé con una puerta abierta"})
    assert r.status_code == 201
    assert r.json()["interpretation"] is None
    assert client.get("/api/dreams").json()[0]["interpretation"] is None
    assert "sueño" in caplog.text
    assert "puerta abierta" not in caplog.text


def test_export_json_ascendente(client):
    ids = [
        client.post("/api/dreams", json={"text": f"sueño {i}"}).json()["id"]
        for i in range(3)
    ]
    r = client.get("/api/dreams/export")
    assert r.status_code == 200
    assert "attachment" in r.headers["content-disposition"]
    data = r.json()
    assert data["version"] == 1
    assert [d["id"] for d in data["dreams"]] == ids


def test_export_vacio(client):
    assert client.get("/api/dreams/export").json()["dreams"] == []