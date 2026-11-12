import os
import sqlite3

DB_PATH = os.environ.get("ONIRO_DB", "oniro.db")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS dreams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    interpretation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
"""


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(_SCHEMA)
    return conn


def create_dream(text):
    with connect() as conn:
        cur = conn.execute("INSERT INTO dreams (text) VALUES (?)", (text,))
        return cur.lastrowid


def set_interpretation(dream_id, interpretation):
    with connect() as conn:
        conn.execute(
            "UPDATE dreams SET interpretation = ? WHERE id = ?",
            (interpretation, dream_id),
        )


def get_dream(dream_id):
    with connect() as conn:
        row = conn.execute(
            "SELECT * FROM dreams WHERE id = ?", (dream_id,)
        ).fetchone()
    return dict(row) if row else None


def list_dreams():
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM dreams ORDER BY id DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def delete_dream(dream_id):
    with connect() as conn:
        conn.execute("DELETE FROM dreams WHERE id = ?", (dream_id,))