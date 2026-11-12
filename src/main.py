from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src import db, llm

app = FastAPI(title="oniro")


class DreamIn(BaseModel):
    text: str


def _as_dict(dream_id):
    dream = db.get_dream(dream_id)
    if dream is None:
        raise HTTPException(404, "Sueño no encontrado")
    return dream


@app.post("/api/dreams", status_code=201)
def create_dream(payload: DreamIn):
    text = payload.text.strip()
    if not text:
        raise HTTPException(400, "El sueño no puede estar vacío")
    dream_id = db.create_dream(text)
    try:
        db.set_interpretation(dream_id, llm.interpret(text))
    except Exception:
        pass
    return _as_dict(dream_id)


@app.post("/api/dreams/{dream_id}/interpret")
def reinterpret(dream_id: int):
    dream = _as_dict(dream_id)
    db.set_interpretation(dream_id, llm.interpret(dream["text"]))
    return _as_dict(dream_id)


@app.get("/api/dreams")
def get_dreams():
    return db.list_dreams()


@app.get("/api/dreams/{dream_id}")
def get_dream(dream_id: int):
    return _as_dict(dream_id)


@app.delete("/api/dreams/{dream_id}", status_code=204)
def delete_dream(dream_id: int):
    db.delete_dream(dream_id)


app.mount("/", StaticFiles(directory="web", html=True), name="web")