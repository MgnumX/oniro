# oniro

Diario web de sueños con API FastAPI, almacenamiento local SQLite e interpretación en español mediante un endpoint LLM compatible con OpenAI. Incluye una interfaz PWA.

## Stack

Python 3.11+, FastAPI, Uvicorn, SQLite y JavaScript sin framework. Motion va vendorizado en `web/vendor/`, así que la interfaz no depende de CDN; el service worker cachea el shell para uso sin conexión.

## Ejecutar

Requiere `uv` y un servidor LLM compatible. Por defecto apunta a Ollama en `http://localhost:11434` con el modelo `llama3.2`.

```bash
uv sync --dev
uv run uvicorn src.main:app --reload
```

Config opcional: `ONIRO_LLM_BASE`, `ONIRO_MODEL`, `ONIRO_API_KEY` y `ONIRO_DB`. La base predeterminada es `oniro.db`; queda local y está excluida de Git.

## Ejemplo de salida

Fragmento real de la respuesta determinista del test (LLM simulada, sueño sintético):

```text
**Símbolos**
- reflejo del texto

**Mensaje**
Calma. (Soñé)
```

Con un modelo real, la interpretación depende de su respuesta.

## Tests

```bash
uv run pytest -q
node --test tests/web-physics.test.js
```
