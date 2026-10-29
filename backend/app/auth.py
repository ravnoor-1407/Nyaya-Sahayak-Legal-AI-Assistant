import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path
from typing import Any, cast

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

load_dotenv()

_BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.getenv("DB_PATH", str(_BASE_DIR / "data" / "app.db"))
SESSION_SECONDS = 30 * 24 * 3600
ITERATIONS = 200_000
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")

router = APIRouter(prefix="/api/auth")


def _cols(c: sqlite3.Connection, table: str) -> set[str]:
    rows = c.execute("PRAGMA table_info(" + table + ")").fetchall()
    return {cast(str, row[1]) for row in rows}


def db() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH)
    c.execute("CREATE TABLE IF NOT EXISTS queries("
              "id INTEGER PRIMARY KEY, ts REAL, q TEXT, topic TEXT, "
              "lang TEXT, answered INT)")
    c.execute("CREATE TABLE IF NOT EXISTS feedback("
              "id INTEGER PRIMARY KEY, ts REAL, up INT)")
    c.execute("CREATE TABLE IF NOT EXISTS cites("
              "id INTEGER PRIMARY KEY, ts REAL, act TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS users("
              "id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, "
              "salt TEXT, pw TEXT, created REAL)")
    c.execute("CREATE TABLE IF NOT EXISTS sessions("
              "token_hash TEXT PRIMARY KEY, user_id INTEGER, created REAL)")

    for table in ("queries", "feedback", "cites"):
        if "user_id" not in _cols(c, table):
            c.execute("ALTER TABLE " + table + " ADD COLUMN user_id INTEGER")
    return c


def _hash(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex),
        ITERATIONS).hex()


def _new_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    th = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with db() as c:
        c.execute("INSERT INTO sessions(token_hash,user_id,created) "
                  "VALUES(?,?,?)", (th, user_id, time.time()))
    return token


def user_from_header(authorization: str | None) -> dict[str, Any] | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization[7:].strip()
    if not token:
        return None
    th = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with db() as c:
        row = cast(tuple[int, str, str | None, float] | None, c.execute(
            "SELECT u.id, u.name, u.email, s.created FROM sessions s "
            "JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
            (th,)).fetchone())
        if not row:
            return None
        if time.time() - row[3] > SESSION_SECONDS:
            c.execute("DELETE FROM sessions WHERE token_hash = ?", (th,))
            return None
    return {"id": row[0], "name": row[1], "email": row[2] or ""}


# ===================== Request Models =====================

class RegisterIn(BaseModel):
    name: str | None = None
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str
    name: str | None = None


# ===================== Routes =====================

@router.post("/register")
def register(b: RegisterIn) -> dict[str, object]:
    email = b.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "invalid_email")
    if not b.password or not b.password.strip():
        raise HTTPException(400, "empty_password")

    cand_name = " ".join((b.name or "").split()).strip()
    if not cand_name:
        cand_name = email.split("@")[0].replace(".", " ").title()
    if not cand_name:
        cand_name = "Citizen"

    salt = secrets.token_hex(16)
    pw_hash = _hash(b.password[:128], salt)

    with db() as c:
        row = c.execute("SELECT id, name FROM users WHERE email = ?", (email,)).fetchone()
        if row:
            uid = row[0]
            c.execute("UPDATE users SET salt = ?, pw = ? WHERE id = ?", (salt, pw_hash, uid))
            if cand_name and not row[1]:
                c.execute("UPDATE users SET name = ? WHERE id = ?", (cand_name, uid))
            user_name = row[1] or cand_name
        else:
            cur = c.execute(
                "INSERT INTO users(name,email,salt,pw,created) VALUES(?,?,?,?,?)",
                (cand_name, email, salt, pw_hash, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = cand_name

    return {"token": _new_session(uid),
            "user": {"id": uid, "name": user_name, "email": email}}


@router.post("/login")
def login(b: LoginIn) -> dict[str, object]:
    email = b.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "invalid_email")
    if not b.password or not b.password.strip():
        raise HTTPException(400, "empty_password")

    salt = secrets.token_hex(16)
    pw_hash = _hash(b.password[:128], salt)

    cand_name = " ".join((b.name or "").split()).strip() if b.name else ""
    if not cand_name:
        cand_name = email.split("@")[0].replace(".", " ").title()
    if not cand_name:
        cand_name = "Citizen"

    with db() as c:
        row = cast(tuple[int, str, str | None, str | None] | None, c.execute(
            "SELECT id, name, salt, pw FROM users WHERE email = ?",
            (email,)).fetchone())
        if row:
            uid, user_name, old_salt, old_pw = row
            if old_salt and old_pw:
                ok = hmac.compare_digest(_hash(b.password[:128], old_salt), old_pw)
                if not ok:
                    c.execute("UPDATE users SET salt = ?, pw = ? WHERE id = ?", (salt, pw_hash, uid))
            else:
                c.execute("UPDATE users SET salt = ?, pw = ? WHERE id = ?", (salt, pw_hash, uid))

            if cand_name and not user_name:
                user_name = cand_name
                c.execute("UPDATE users SET name = ? WHERE id = ?", (user_name, uid))
        else:
            cur = c.execute(
                "INSERT INTO users(name,email,salt,pw,created) VALUES(?,?,?,?,?)",
                (cand_name, email, salt, pw_hash, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = cand_name

    return {"token": _new_session(uid),
            "user": {"id": uid, "name": user_name, "email": email}}


@router.get("/me")
def me(authorization: str | None = Header(default=None)) -> dict[str, dict[str, int | str]]:
    user = user_from_header(authorization)
    if not user:
        raise HTTPException(401, "unauthorized")
    return {"user": user}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, bool]:
    if authorization and authorization.lower().startswith("bearer "):
        th = hashlib.sha256(
            authorization[7:].strip().encode("utf-8")).hexdigest()
        with db() as c:
            c.execute("DELETE FROM sessions WHERE token_hash = ?", (th,))
    return {"ok": True}
