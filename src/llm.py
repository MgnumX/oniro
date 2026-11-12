import json
import os
import urllib.request

BASE = os.environ.get("ONIRO_LLM_BASE", "http://localhost:11434")
API_KEY = os.environ.get("ONIRO_API_KEY", "")
MODEL = os.environ.get("ONIRO_MODEL", "llama3.2")

SYSTEM_PROMPT = (
    "Eres un intérprete de sueños creativo y empático. Interpreta el sueño "
    "del usuario en español, en Markdown, con estas secciones: **Símbolos**, "
    "**Emociones**, **Temas** y **Mensaje**. Sé cálido, simbólico y literario, "
    "nunca diagnóstico: no afirmes cuestiones médicas, psicológicas, "
    "financieras ni proféticas como hechos. Termina con una frase corta de "
    "reflexión personal."
)


def interpret(dream_text):
    body = json.dumps(
        {
            "model": MODEL,
            "stream": False,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": dream_text},
            ],
        }
    ).encode()
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    req = urllib.request.Request(BASE + "/v1/chat/completions", data=body, headers=headers)
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.load(resp)
    return data["choices"][0]["message"]["content"]