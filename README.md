# oniro

Diario web de sueños con API FastAPI, almacenamiento local SQLite e interpretación en español mediante un endpoint LLM compatible con OpenAI. Incluye una interfaz PWA.

Los sueños quedan en un archivo SQLite local: no hay cuentas ni servidor externo. La interpretación es opcional; sin un LLM configurado, la app guarda y muestra los sueños igual. A diferencia de un diario en la nube, tú eliges el modelo y el dato no sale de tu máquina.

## Stack

Python 3.11+, FastAPI, Uvicorn, SQLite y JavaScript sin framework. Motion va vendorizado en `web/vendor/`, así que la interfaz no depende de un CDN para animarse. Las tipografías se cargan de Google Fonts y caen a fuentes del sistema sin red; el service worker cachea el shell para uso sin conexión y nunca cachea `/api`, para no mostrar sueños viejos.

## Ejecutar

Requiere `uv` y Python 3.11+. Para interpretar sueños necesitas un servidor compatible con OpenAI; por defecto apunta a Ollama en `http://localhost:11434` con el modelo `llama3.2`. Sin ese servidor la app arranca y guarda sueños, pero la interpretación falla.

```bash
uv sync --dev
uv run uvicorn src.main:app --reload
```

Abre `http://127.0.0.1:8000`. Config opcional: `ONIRO_LLM_BASE`, `ONIRO_MODEL`, `ONIRO_API_KEY` y `ONIRO_DB`. La base predeterminada es `oniro.db`; queda local y está excluida de Git.

La API expone `POST /api/dreams`, `GET /api/dreams`, `GET /api/dreams/export`, `GET /api/dreams/{id}`, `POST /api/dreams/{id}/interpret` y `DELETE /api/dreams/{id}`. La interfaz web usa esos mismos endpoints. `GET /api/dreams/export` descarga todos los sueños en JSON; el enlace está en el pie de la página.

## Ejemplo de salida

Fragmento real de la respuesta determinista del test (LLM simulada, sueño sintético):

```text
**Símbolos**
- reflejo del texto

**Mensaje**
Calma. (Soñé)
```

Con un modelo real, la interpretación depende de su respuesta.

## Estado

MVP funcional: crear, listar, interpretar, exportar y borrar sueños, PWA con caché offline y tests de API con el LLM simulado. No tiene autenticación ni soporte multiusuario; está pensado para uso local.

## Tests

```bash
uv run pytest -q
node --test tests/web-physics.test.js
```

## Licencia

MIT — ver [LICENSE](LICENSE).
