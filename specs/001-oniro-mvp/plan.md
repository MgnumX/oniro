# Implementation Plan: oniro MVP

**Branch**: `001-oniro-mvp` | **Date**: 2026-08-12 | **Spec**: `specs/001-oniro-mvp/spec.md`

**Input**: Feature specification from `/specs/001-oniro-mvp/spec.md`

## Summary

Microservicio SaaS que sirve una PWA de diario de sueños y los interpreta con un LLM local (Ollama, API compatible OpenAI). Un solo servicio, un solo repo, cinco endpoints, una tabla SQLite. Camino a Android/iOS: PWA instalable hoy, Capacitor mañana.

## Technical Context

**Language/Version**: Python 3.11+ (entorno uv, Python 3.13 en el venv)

**Primary Dependencies**: `fastapi`, `uvicorn` (dev: `pytest`, `httpx`)

**Storage**: SQLite (stdlib `sqlite3`), tabla `dreams(id, text, interpretation, created_at)`

**Testing**: pytest, LLM mockeado con monkeypatch; verificación end-to-end con modelo real

**Target Platform**: Web (PC + móvil), PWA instalable

**Project Type**: web-service (API REST + static UI en el mismo origen)

**Performance Goals**: interpretación útil en <60s con llama3.2 (3B) en CPU de 16 núcleos; espera visible con spinner

**Constraints**: sin GPU dedicada; Ollama en el mismo host en el MVP; privacidad de los sueños (nada sale del host salvo decisión explícita)

**Scale/Scope**: usuario único en LAN; 1 microservicio; 1 PWA

## Constitution Check

PASA: ponytail (5 endpoints, stdlib sqlite3/urllib, sin ORM/frontend-framework); intercambio LLM por env; guardrail de no-diagnóstico en prompt; validación en el borde de la API; pruebas mínimas con LLM mockeado.

## Project Structure

### Documentation

```text
specs/001-oniro-mvp/
├── spec.md       # requisitos y escenarios (>/speckit.specify)
├── plan.md       # este archivo (>/speckit.plan)
└── tasks.md      # desglose ejecutable (>/speckit.tasks)
```

### Source Code

```text
oniro/
├── pyproject.toml          # uv; deps fastapi+uvicorn; dev pytest+httpx
├── src/
│   ├── main.py             # FastAPI: 5 endpoints + static mount web/
│   ├── db.py               # sqlite3: create/get/list/delete + set_interpretation
│   └── llm.py              # POST OpenAI-compatible /v1/chat/completions, env-swappable
├── web/                    # PWA sin build
│   ├── index.html          # compositor + historial
│   ├── styles.css          # cielo nocturno CSS, glassmorphism, mobile-first
│   ├── app.js              # fetch + render (~120 líneas)
│   ├── manifest.json       # PWA installable
│   ├── sw.js               # service worker cache-first del shell
│   └── icon.svg            # ícono luna
└── tests/
    └── test_api.py         # CRUD + 400 + re-interpretación, LLM mockeado
```

### Chief Interfaces

- `POST /api/dreams` `{text}` → `201` dream con `interpretation`.
- `POST /api/dreams/{id}/interpret` → `200` dream reinterpretado.
- `GET /api/dreams` → lista desc; `GET /api/dreams/{id}` → detalle; `DELETE /api/dreams/{id}` → `204`.

### Data Model

```sql
CREATE TABLE IF NOT EXISTS dreams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    interpretation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### LLM

`POST {ONIRO_LLM_BASE||http://localhost:11434}/v1/chat/completions`, modelo `ONIRO_MODEL||llama3.2`, `stream:false`, timeout 180s. Prompt de sistema en español con guardrail de no-diagnóstico. Fallo del LLM → `interpretation: null` (nunca borra el sueño).

### Rollout

MVP: `uv run uvicorn src.main:app --host 0.0.0.0 --port 8000`; acceso LAN. Link público futuro: VPS+Ollama (barato/lento) o API externa por env (rápido/con costo por llamada).