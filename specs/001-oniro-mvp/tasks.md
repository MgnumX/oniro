# Tasks: oniro MVP

**Branch**: `001-oniro-mvp` | **Date**: 2026-08-12 | **Spec**: `specs/001-oniro-mvp/spec.md`

> Estado: **todas completadas**. Implementación ejecutada y verificada end-to-end con llama3.2 real.

## T-01 Crear repo y pyproject (DONE)
- [x] `git init`, estructura `src/ web/ tests/ specs/`
- [x] `pyproject.toml` con `uv` (fastapi, uvicorn; dev pytest, httpx)
- [x] `uv sync`, suites listas

## T-02 Backend: persistencia (DONE)
- [x] `src/db.py`: `connect()` con `CREATE TABLE IF NOT EXISTS`
- [x] funciones `create_dream`, `set_interpretation`, `get_dream`, `list_dreams`, `delete_dream`

## T-03 Backend: cliente LLM intercambiable (DONE)
- [x] `src/llm.py`: POST OpenAI-compatible `/v1/chat/completions` con `urllib`
- [x] env: `ONIRO_LLM_BASE`, `ONIRO_API_KEY`, `ONIRO_MODEL`
- [x] prompt de sistema en español con guardrail de no-diagnóstico; timeout 180s

## T-04 Backend: API REST (DONE)
- [x] `POST /api/dreams` (valida texto no vacío; interpreta; 201)
- [x] `POST /api/dreams/{id}/interpret`, `GET /api/dreams`, `GET /api/dreams/{id}` (404), `DELETE /api/dreams/{id}` (204)
- [x] static mount de `web/` en el mismo origen

## T-05 Frontend PWA (DONE)
- [x] `web/index.html`, `styles.css` (mobile-first, cielo nocturno CSS, glassmorphism)
- [x] `web/app.js`: POST, spinner, render de tarjetas, borrar/reinterpretar
- [x] `web/manifest.json`, `web/sw.js`, `web/icon.svg` (instalable)

## T-06 Pruebas (DONE)
- [x] `tests/test_api.py` con LLM mockeado: flujo CRUD completo, 400 en texto vacío, 404 en id inexistente
- [x] `uv run pytest -q` → 2 passed

## T-07 Verificación end-to-end (DONE)
- [x] servidor arriba, `GET /` 200
- [x] sueño real interpretado por llama3.2 en español con 4 secciones

## Diferido (marcado, no construido)
- Streaming de interpretación → añadir cuando la espera de 10-60s moleste.
- Auth multiusuario → cuando se exponga fuera de LAN.
- Dockerfile → cuando haya servidor remoto.
- Estadísticas/temas recurrentes → cuando el diario tenga historial real.
- Segundo microservicio → cuando haya evidencia medible.