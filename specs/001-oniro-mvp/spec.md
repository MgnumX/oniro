# Feature Specification: oniro MVP — diario e intérprete de sueños

**Feature Branch**: `001-oniro-mvp`

**Created**: 2026-08-12

**Status**: Implementado

**Input**: "App web multiplataforma (PC + móvil) con GUI de alto diseño, simple y rápida, que guarda sueños y los interpreta con IA en español. Microservicio SaaS; base Future Android/iOS = PWA instalable."

## User Scenarios & Testing

### User Story 1 - Escribir un sueño y recibir la interpretación (Priority: P1)

Una persona escribe el recuerdo de su sueño en un cuadro de texto, pulsa "Interpretar" y recibe una lectura simbólica en español (Símbolos, Emociones, Temas, Mensaje) en la misma pantalla, con posibilidad de guardarla en su diario.

**Why this priority**: Es la promesa central del producto; sin esto no hay app.

**Independent Test**: `curl -X POST /api/dreams -d '{"text":"…"}'` devuelve 201 con el sueño y su interpretación, y `GET /api/dreams` lo lista.

**Acceptance Scenarios**:

1. **Given** Ollama corriendo localmente, **When** el usuario envía un sueño, **Then** la API devuelve 201 con `interpretation` en Markdown en español con las 4 secciones.
2. **Given** el texto enviado está vacío o es solo espacios, **When** se envía, **Then** la API responde 400.
3. **Given** el LLM falla (Ollama caído), **When** se envía el sueño, **Then** el sueño se guarda con `interpretation: null` y el cliente ofrece reintentar.

### User Story 2 - Diario: ver historial, detalle y borrar (Priority: P2)

El usuario ve sus sueños pasados ordenados de más reciente a más antiguo, abre uno, lo reinterpreta o lo borra.

**Why this priority**: Convierte la curiosidad en una utilidad recurrente (el "mega-proyecto funcional").

**Independent Test**: `GET /api/dreams` lista en orden descendente, `GET /api/dreams/{id}` da detalle, `DELETE /api/dreams/{id}` devuelve 204 y luego 404.

**Acceptance Scenarios**:

1. **Given** hay sueños guardados, **When** se pide el historial, **Then** se devuelven ordenados por id descendente.
2. **Given** un sueño sin interpretación, **When** se pide `POST /api/dreams/{id}/interpret`, **Then** se reinterpreta y se actualiza.
3. **Given** un id inexistente, **When** se consulta `GET /api/dreams/{id}`, **Then** la API responde 404.

### User Story 3 - App instalable en el móvil (Priority: P3)

El usuario entra desde el navegador del celular, "Añadir a pantalla de inicio" la instala como app independiente (PWA).

**Why this priority**: Es la base iOS/Android sin reescribir nada; no bloquea el uso web.

**Independent Test**: Google Lighthouse devuelve PWA instalable; `manifest.json` válido y service worker registrado.

**Acceptance Scenarios**:

1. **Given** el usuario visita la app en Chrome móvil, **When** selecciona Añadir a pantalla de inicio, **Then** se instala y abre como standalone.
2. **Given** la app sin conexión, **When** se recarga, **Then** el shell (CSS/JS) se sirve desde caché del service worker.

### Edge Cases

- LLM caído o timeout de 180s: sueño se guarda sin interpretación; reintento explícito.
- Texto vacío / solo espacios: 400 en el borde de la API.
- Sueño inexistente: 404.
- Espera de interpretación (10-60s en CPU): spinner en UI, sin bloqueo visual.

## Requirements

### Functional Requirements

- **FR-001**: La API DEBE crear un sueño desde texto no vacío y, en la misma llamada, interpretarlo (o dejarlo sin interpretación si el LLM falla).
- **FR-002**: La API DEBE exponer listado (reciente→antiguo), detalle, borrado y re-interpretación.
- **FR-003**: La interpretación DEBE venir en español, en Markdown, con Símbolos, Emociones, Temas y Mensaje, con guardrail explícito de no-diagnóstico.
- **FR-004**: El servicio DEBE servir la UI (HTML/CSS/JS) y la API desde el mismo origen.
- **FR-005**: La UI DEBE ser mobile-first, en español, con entrada grande del sueño, spinner durante la interpretación y tarjetas de historial.
- **FR-006**: La app DEBE ser instalable como PWA (manifest + service worker + ícono).
- **FR-007**: La persistencia DEBE usar SQLite, una tabla `dreams`, sin ORM.
- **FR-008**: El proveedor de LLM DEBE ser intercambiable por variables de entorno (base URL, API key, modelo), API compatible OpenAI.