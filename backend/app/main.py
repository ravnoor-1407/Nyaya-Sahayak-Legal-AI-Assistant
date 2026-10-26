import json
import time
from collections import Counter
from pathlib import Path
from typing import Any, Iterable, cast

import joblib  # type: ignore[reportMissingTypeStubs]
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import rag
from .auth import db, router as auth_router, user_from_header
import os
from .safety import check_blocked, self_harm, danger_note, scrub  # type: ignore[reportUnknownVariableType]

app = FastAPI(title="Justice Department Assistant API")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "online",
        "service": "NyayaSahayak Legal AI Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}

CHUNKS: list[dict[str, Any]] = [json.loads(l) for l in
                                open("data/processed/chunks.jsonl", encoding="utf-8")]
HELPLINES: Any = json.load(open("app/data/helplines.json", encoding="utf-8"))
EVAL_PATH = Path("data/eval_results.json")
CLF: Any = (joblib.load("data/topic_clf.joblib")
            if Path("data/topic_clf.joblib").exists() else None)


class ChatIn(BaseModel):
    question: str
    lang: str = "en"


class FeedbackIn(BaseModel):
    up: bool


def _log(user: dict[str, Any] | None, q: str, topic: str, lang: str,
         answered: bool, acts: Iterable[str] = ()) -> None:
    # Only signed-in users are tracked. Phone, email and ID numbers are
    # removed from the question text before it is stored.
    if not user:
        return
    now = time.time()
    with db() as c:
        c.execute(
            "INSERT INTO queries(ts,q,topic,lang,answered,user_id) "
            "VALUES(?,?,?,?,?,?)",
            (now, cast(str, scrub(q)), topic, lang, int(answered), user["id"]))
        for a in acts:
            c.execute("INSERT INTO cites(ts,act,user_id) VALUES(?,?,?)",
                      (now, a, user["id"]))


@app.post("/api/chat")
def chat(body: ChatIn, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user: Any = user_from_header(authorization)
    q = body.question.strip()[:1000]
    lang = body.lang if body.lang in ("en", "hi", "pa") else "en"
    if not q:
        return {"answer": "Please type a question.", "sources": [],
                "answered": False}

    blocked = check_blocked(q, lang)
    if blocked:
        _log(user, q, "blocked", lang, False)
        return {"answer": blocked, "sources": [], "answered": False,
                "topic": "blocked"}

    support = self_harm(q, lang)
    if support:
        _log(user, q, "support", lang, False)
        return {"answer": support, "sources": [], "answered": False,
                "topic": "support"}

    topic: str = cast(str, CLF.predict([q])[0]) if CLF else "general"
    try:
        text, sources, ok = cast(
            tuple[str, list[dict[str, Any]], bool], rag.answer(q, lang)  # type: ignore[reportUnknownMemberType]
        )
    except Exception as e:
        return {"answer": "The AI service is busy. Please try again.",
                "sources": [], "answered": False, "error": str(e)[:300]}

    note = danger_note(q, lang)
    if note:
        text = note + "\n\n" + text

    acts = []
    if ok:
        for s in sources[:3]:
            a = s.get("act")
            if a and a not in acts:
                acts.append(a)
    _log(user, q, topic, lang, ok, acts)
    return {"answer": text, "sources": sources, "answered": ok,
            "topic": topic}


@app.get("/api/search")
def search(q: str, act: str | None = None, category: str | None = None,
           limit: int = 12, k: int | None = None) -> list[dict[str, Any]]:
    if k:
        limit = max(1, min(k, 30))
    ql = q.strip().lower()
    out: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    def add(c: dict[str, Any], score: float) -> None:
        key = (c["act"], c["section"], c["text"][:40])
        if key in seen:
            return
        if act and c["act"] != act:
            return
        if category and c["category"] != category:
            return
        seen.add(key)
        out.append({**c, "text": c["text"][:700], "score": score})

    for c in CHUNKS:  # keyword / section-number match first
        if ql == c["section"].lower() or ql in c["title"].lower():
            add(c, 1.0)
    retrieved = cast(list[dict[str, Any]], rag.retrieve(q, k=max(limit, 12)))  # type: ignore[reportUnknownMemberType]
    for h in retrieved:  # then semantic matches
        add(h, round(1 - h["distance"], 3))
    return out[:limit]


@app.get("/api/acts")
def acts() -> list[dict[str, Any]]:
    d: dict[str, dict[str, Any]] = {}
    for c in CHUNKS:
        a = d.setdefault(c["act"], {
            "act": c["act"], "category": c["category"], "year": c["year"],
            "url": c.get("source_url", ""), "count": 0})
        a["count"] += 1
    return list(d.values())


@app.get("/api/acts/sections")
def act_sections(act: str) -> list[dict[str, str]]:
    return [{"section": c["section"], "unit": c["unit"],
             "title": c["title"], "text": c["text"][:900]}
            for c in CHUNKS if c["act"] == act]


@app.get("/api/helplines")
def helplines() -> Any:
    return HELPLINES


@app.post("/api/feedback")
def feedback(f: FeedbackIn, authorization: str | None = Header(default=None)) -> dict[str, bool]:
    user: Any = user_from_header(authorization)
    if user:
        with db() as c:
            c.execute("INSERT INTO feedback(ts,up,user_id) VALUES(?,?,?)",
                      (time.time(), int(f.up), user["id"]))
    return {"ok": True}


@app.get("/api/eval")
def eval_results() -> Any:
    # written by scripts/evaluate.py; empty until you run it
    if EVAL_PATH.exists():
        try:
            return json.loads(EVAL_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


@app.get("/api/stats")
def stats(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user: Any = user_from_header(authorization)
    real_acts = {c["act"] for c in CHUNKS if c["act"] != "IPC to BNS Mapping"}
    out = {
        "signed_in": bool(user),
        "total": 0,
        "answered": 0,
        "by_topic": [],
        "by_lang": [],
        "by_act": [],
        "feedback": {"up": 0, "down": 0},
        "recent": [],
        "corpus": {"sections": len(CHUNKS), "acts": len(real_acts)},
    }
    if not user:
        return out
    uid = user["id"]
    with db() as c:
        rows = c.execute(
            "SELECT q,topic,lang,answered FROM queries WHERE user_id=? "
            "ORDER BY ts DESC", (uid,)).fetchall()
        fb = c.execute(
            "SELECT up, COUNT(*) FROM feedback WHERE user_id=? GROUP BY up",
            (uid,)).fetchall()
        act_rows = c.execute(
            "SELECT act, COUNT(*) FROM cites WHERE user_id=? GROUP BY act "
            "ORDER BY COUNT(*) DESC LIMIT 8", (uid,)).fetchall()
    fbd = {int(u): n for u, n in fb}
    out.update({
        "total": len(rows),
        "answered": sum(r[3] for r in rows),
        "by_topic": [{"name": k, "value": v}
                     for k, v in Counter(r[1] for r in rows).most_common()],
        "by_lang": [{"name": k, "value": v}
                     for k, v in Counter(r[2] for r in rows).most_common()],
        "by_act": [{"name": a, "value": n} for a, n in act_rows],
        "feedback": {"up": fbd.get(1, 0), "down": fbd.get(0, 0)},
        "recent": [{"q": r[0], "topic": r[1], "lang": r[2]}
                   for r in rows[:8]],
    })
    return out
