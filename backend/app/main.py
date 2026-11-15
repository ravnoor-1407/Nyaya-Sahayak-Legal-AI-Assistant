import json
import time
from collections import Counter
from pathlib import Path
from typing import Any, Iterable, cast

import joblib  # type: ignore[reportMissingTypeStubs]
from fastapi import FastAPI, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import rag
from .auth import db, router as auth_router, user_from_header
import os
from .safety import check_blocked, self_harm, danger_note, scrub  # type: ignore[reportUnknownVariableType]

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent
DATA_DIR = ROOT_DIR / "data"
HELPLINES_PATH = APP_DIR / "data" / "helplines.json"


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _load_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


# Resolve project files from the backend root so the API works from any working directory.
CHUNKS: list[dict[str, Any]] = _load_jsonl(DATA_DIR / "processed" / "chunks.jsonl")
HELPLINES: Any = _load_json(HELPLINES_PATH)
EVAL_PATH = DATA_DIR / "eval_results.json"
CLF: Any = joblib.load(DATA_DIR / "topic_clf.joblib") if (DATA_DIR / "topic_clf.joblib").exists() else None

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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": origin if origin != "null" else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        },
    )


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "online",
        "service": "NyayaSahayak Legal AI Assistant API",
        "version": "1.0.1",
        "docs": "/docs",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


class ChatIn(BaseModel):
    question: str
    lang: str = "en"


class FeedbackIn(BaseModel):
    up: bool


class DraftIn(BaseModel):
    doc_type: str = "fir"
    inputs: dict[str, Any] = {}
    lang: str = "en"


class AnalyzeDocIn(BaseModel):
    text: str
    doc_type: str | None = None
    lang: str = "en"


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


def detect_query_lang(text: str, fallback: str = "en") -> str:
    """Auto-detect language from question script (Devanagari -> hi, Gurmukhi -> pa).
    If no Indic script is detected, falls back to the requested UI language."""
    hi_count = sum(1 for ch in text if "\u0900" <= ch <= "\u097f")
    pa_count = sum(1 for ch in text if "\u0a00" <= ch <= "\u0a7f")
    if hi_count > 0 or pa_count > 0:
        return "hi" if hi_count >= pa_count else "pa"
    return fallback


@app.post("/api/chat")
def chat(body: ChatIn, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user: Any = user_from_header(authorization)
    q = body.question.strip()[:1000]
    requested_lang = body.lang if body.lang in ("en", "hi", "pa") else "en"
    lang = detect_query_lang(q, fallback=requested_lang)
    if not q:
        return {"answer": "Please type a question.", "sources": [],
                "answered": False, "lang": lang}

    blocked = check_blocked(q, lang)
    if blocked:
        _log(user, q, "blocked", lang, False)
        return {"answer": blocked, "sources": [], "answered": False,
                "topic": "blocked", "lang": lang}

    support = self_harm(q, lang)
    if support:
        _log(user, q, "support", lang, False)
        return {"answer": support, "sources": [], "answered": False,
                "topic": "support", "lang": lang}

    topic: str = cast(str, CLF.predict([q])[0]) if CLF else "general"
    audit: dict[str, Any] = {}
    try:
        ans_tuple = rag.answer(q, lang)
        if len(ans_tuple) >= 4:
            text, sources, ok, audit = ans_tuple[:4]
        else:
            text, sources, ok = ans_tuple[:3]
    except Exception as e:
        return {"answer": "The AI service is busy. Please try again.",
                "sources": [], "answered": False, "error": str(e)[:300], "lang": lang}

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
            "topic": topic, "lang": lang, "grounding_audit": audit}


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


@app.post("/api/draft")
def draft_doc(body: DraftIn) -> dict[str, Any]:
    """Generate legally grounded formal drafts: Zero-FIR, Legal Notices, Bail Memo."""
    dt = (body.doc_type or "fir").lower()
    inp = body.inputs or {}
    lang = body.lang if body.lang in ("en", "hi", "pa") else "en"

    c_name = inp.get("complainant_name") or inp.get("sender_name") or "Complainant"
    c_contact = inp.get("contact") or inp.get("phone") or "Provided on Record"
    c_addr = inp.get("address") or "Residing within Territorial Jurisdiction"
    op_name = inp.get("accused_name") or inp.get("opposite_party") or "Accused / Opposite Party"
    incident_dt = inp.get("date") or inp.get("incident_date") or time.strftime("%d/%m/%Y")
    incident_place = inp.get("location") or inp.get("place") or "Within Jurisdiction"
    desc = inp.get("description") or "Details of the legal grievance as stated herein."
    amount = inp.get("amount") or inp.get("cheque_amount") or ""
    chq_num = inp.get("cheque_number") or ""
    bank = inp.get("bank_name") or ""
    police_stn = inp.get("police_station") or "Station House Officer, Concerned Police Station"

    # Build prompt for generative LLM
    prompt = f"""You are a senior Indian legal drafting advocate. Generate a formal, professional legal draft under current Indian law.
DOCUMENT TYPE: {dt}
LANGUAGE: {lang}
INPUT DETAILS:
- Complainant / Sender: {c_name}
- Contact & Address: {c_contact}, {c_addr}
- Opposite Party / Accused / Police Station: {op_name} at {police_stn}
- Incident / Transaction Date & Place: {incident_dt} at {incident_place}
- Description & Facts: {desc}
- Financial / Property Value (if any): {amount} (Cheque No: {chq_num}, Bank: {bank})

REQUIREMENTS:
1. Use formal Indian legal court/advocate formatting (all capital headings, numbered paragraphs, verification clause, prayer).
2. Explicitly cite the modern 2023 statutes:
   - For Police Complaint / FIR: Cite Section 173 Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) and relevant Bharatiya Nyaya Sanhita, 2023 (BNS) offences (e.g. Theft BNS 303, Cheating BNS 318, Simple Hurt BNS 115, Cyber Offences under IT Act 2000).
   - For Cheque Bounce: Cite Section 138 of Negotiable Instruments Act, 1881 with statutory 15-day demand.
   - For Consumer Notice: Cite Consumer Protection Act, 2019 for deficiency in service and unfair trade practice.
   - For Tenant Notice: Cite statutory tenancy rights and 15-day refund demand.
3. Write clean, complete, ready-to-print legal text in {lang} language."""

    try:
        draft_text = llm.generate(prompt)
        if draft_text and len(draft_text.strip()) > 100:
            return {"draft": draft_text.strip(), "doc_type": dt, "status": "generated", "lang": lang}
    except Exception as e:
        print(f"[DRAFT] LLM generation note: {e}")

    # Fallback template if LLM is offline or busy
    if dt == "cheque_notice":
        draft_text = f"""LEGAL DEMAND NOTICE
(UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881)

REGISTERED A.D. / SPEED POST
Date: {time.strftime('%d/%m/%Y')}

TO,
{op_name}
{incident_place}

FROM,
{c_name}
{c_addr}
Contact: {c_contact}

SUBJECT: STATUTORY DEMAND NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881 FOR DISHONOUR OF CHEQUE NO. {chq_num} FOR RS. {amount}/- DRAWN ON {bank}.

Sir/Madam,

Under instructions from and on behalf of my client {c_name}, I hereby serve upon you the following statutory notice:

1. That in discharge of your legally enforceable debt and liability towards my client, you had issued Cheque bearing No. {chq_num} dated {incident_dt} for a sum of Rs. {amount}/- drawn on {bank}.
2. That my client presented the said cheque for encashment through their bankers within the period of its validity.
3. That the said cheque was returned unpaid and dishonoured by your bankers with the return memo stating reason 'Funds Insufficient' / 'Payment Stopped'.
4. That the said dishonour of cheque clearly attracts criminal culpability under Section 138 read with Section 141 of the Negotiable Instruments Act, 1881.
5. {desc}

NOW THEREFORE, I hereby call upon you to make the payment of the aforesaid cheque amount of Rs. {amount}/- (Rupees {amount} only) to my client within 15 (FIFTEEN) DAYS from the date of receipt of this notice, failing which my client shall be constrained to initiate criminal proceedings against you in the Competent Court of Judicial Magistrate under Section 138 of the Negotiable Instruments Act, 1881, at your sole cost and peril.

Copy retained for legal record.

{c_name}
(Complainant / Payee)"""
    elif dt in ("consumer_notice", "consumer"):
        draft_text = f"""LEGAL NOTICE FOR DEFICIENCY IN SERVICE & UNFAIR TRADE PRACTICE
(UNDER THE CONSUMER PROTECTION ACT, 2019)

Date: {time.strftime('%d/%m/%Y')}

TO,
{op_name}
{incident_place}

FROM,
{c_name}
{c_addr}
Contact: {c_contact}

SUBJECT: NOTICE FOR DEFICIENCY IN SERVICE, DEFECTIVE PRODUCT, AND DAMAGES UNDER SECTIONS 2(11) & 35 OF THE CONSUMER PROTECTION ACT, 2019.

Sir/Madam,

1. That the Complainant had engaged your services / purchased goods from you on {incident_dt} for valuable consideration amounting to Rs. {amount}/-.
2. That upon receiving the said goods/services, the Complainant discovered severe deficiency, negligence, and non-compliance with statutory standards.
3. Particulars of Deficiency: {desc}
4. That despite repeated reminders and representations, you have failed and neglected to rectify the defect, provide replacement, or refund the consideration amount.
5. That your aforesaid acts constitute gross deficiency in service under Section 2(11) and Unfair Trade Practice under Section 2(47) of the Consumer Protection Act, 2019.

NOW THEREFORE, you are hereby called upon to:
a) Refund the sum of Rs. {amount}/- along with interest @ 18% p.a.;
b) Pay a sum of Rs. 25,000/- towards mental harassment and litigation expenses;
within 15 days of receipt of this notice, failing which a formal Consumer Complaint shall be instituted before the Competent District Consumer Disputes Redressal Commission under Section 35 of the Consumer Protection Act, 2019.

Yours faithfully,

{c_name}"""
    else:  # Default: Police Complaint / FIR under Section 173 BNSS
        draft_text = f"""FORMAL POLICE COMPLAINT / ZERO-FIR APPLICATION
(UNDER SECTION 173 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023)

TO,
THE STATION HOUSE OFFICER (SHO),
{police_stn}
Date: {time.strftime('%d/%m/%Y')}

SUBJECT: COMPLAINT UNDER SECTION 173 BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR REGISTRATION OF FIR IN RESPECT OF COGNIZABLE OFFENCES COMMITTED UNDER THE BHARATIYA NYAYA SANHITA, 2023 (BNS).

1. COMPLAINANT DETAILS:
   - Full Name: {c_name}
   - Contact Number: {c_contact}
   - Permanent / Current Address: {c_addr}

2. INCIDENT DETAILS:
   - Date and Time of Incident: {incident_dt}
   - Exact Place of Occurrence: {incident_place}
   - Details of Suspect/Accused (if known): {op_name}

3. FACTS OF THE COMPLAINT:
   {desc}

4. OFFENCES COMMITTED:
   The acts committed by the accused persons disclose cognizable offences under the Bharatiya Nyaya Sanhita, 2023 (including Section 303 for theft, Section 318 for cheating/fraud, Section 115 for hurt, and Section 351 for criminal intimidation, as applicable).

5. PRAYER:
   In light of Section 173(1) of the Bharatiya Nagarik Suraksha Sanhita, 2023, it is mandatory for the police officer to register a First Information Report (FIR) upon receiving information disclosing a cognizable offence. It is therefore respectfully prayed that:
   a) A First Information Report (FIR) be registered forthwith;
   b) A free copy of the registered FIR be provided to the Complainant as mandated by Section 173(2) BNSS;
   c) Immediate investigation be launched and appropriate legal action be taken against the culprits.

VERIFICATION:
I, {c_name}, do hereby verify and declare that the contents of the above complaint are true and correct to the best of my personal knowledge and belief, and nothing material has been concealed therein.

Place: {incident_place}
Date: {time.strftime('%d/%m/%Y')}

____________________________
Signature / Thumb Impression of Complainant
({c_name})"""

    return {"draft": draft_text.strip(), "doc_type": dt, "status": "template_fallback", "lang": lang}


@app.post("/api/analyze-doc")
def analyze_document(body: AnalyzeDocIn) -> dict[str, Any]:
    """Scan and summarize legal documents, contracts, summons, and notices with risk ratings."""
    text = (body.text or "").strip()
    lang = body.lang if body.lang in ("en", "hi", "pa") else "en"
    if not text:
        return {"error": "Document text cannot be empty.", "analyzed": False}

    prompt = f"""You are a specialized Indian legal analyst. Analyze the following legal document / notice / agreement text:
DOCUMENT TEXT:
\"\"\"{text[:4000]}\"\"\"

Provide a structured, plain-language analysis in {lang} addressing:
1. EXECUTIVE SUMMARY: What is this document and what is its core purpose?
2. URGENT DEADLINES & RISK LEVEL: Identify any time windows (e.g. 7 days, 15 days), consequences of non-compliance, and overall risk rating (LOW, MEDIUM, HIGH, CRITICAL).
3. KEY STATUTORY SAFEGUARDS: What rights or protections does the individual have under Indian law (Constitution, BNSS, BNS, Consumer Act, NI Act, etc.)?
4. RECOMMENDED ACTION CHECKLIST: Clear step-by-step instructions on what to do next.

Format using bold titles and clean bullet points."""

    try:
        analysis_text = llm.generate(prompt)
        if analysis_text and len(analysis_text.strip()) > 100:
            return {"analysis": analysis_text.strip(), "analyzed": True, "lang": lang}
    except Exception as e:
        print(f"[DOC ANALYZE] Note: {e}")

    # Fallback heuristic analysis
    has_bnss_notice = bool(re.search(r"35|notice|appearance|police", text, re.I))
    has_138 = bool(re.search(r"138|cheque|negotiable|dishonour", text, re.I))
    has_lease = bool(re.search(r"rent|lease|tenant|landlord|deposit", text, re.I))

    if has_138:
        summary = "This document appears to be a Statutory Legal Notice under Section 138 of the Negotiable Instruments Act, 1881 regarding dishonour of a cheque."
        risks = "CRITICAL RISK: A mandatory 15-day cure period applies from the date of receipt. Failure to pay within 15 days allows the payee to file a criminal complaint in the Magistrate Court within the next 30 days."
        rights = "You have the right to inspect the bank memo, verify the debt liability, and present defenses if the cheque was given for security or if there was no existing debt."
        steps = "1. Consult an advocate immediately.\n2. Do not ignore the notice.\n3. Reply within 15 days stating your legal defense or clear the undisputed dues."
    elif has_bnss_notice:
        summary = "This document appears to be a Notice of Appearance under Section 35(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 (or former Section 41A CrPC)."
        risks = "HIGH RISK: The police officer is requiring your appearance for investigation. If you comply with the notice, the police CANNOT arrest you without prior written court permission under Section 35(4) BNSS."
        rights = "Under Section 35(3) and (4) BNSS, you have the right not to be arrested as long as you comply with the terms of the notice. You have the right to have an advocate accompany you under Article 22(1)."
        steps = "1. Note the appearance date and time.\n2. Carry identity documents and evidence supporting your innocence.\n3. Keep a copy of your appearance acknowledgment signed by the investigating officer."
    else:
        summary = "This document represents a formal legal communication, agreement, or notice between parties."
        risks = "MEDIUM RISK: Review all timeline clauses and liability terms carefully before signing or responding."
        rights = "Any clause violating statutory public policy or fundamental rights under Article 21 is void and unenforceable under Section 23 of the Indian Contract Act."
        steps = "1. Read all clauses thoroughly.\n2. Note any monetary claims or deadlines.\n3. Seek free legal consultation via NALSA helpline 15100 if in doubt."

    fallback_analysis = f"""### 1. Executive Summary
{summary}

### 2. Urgent Deadlines & Risk Level
{risks}

### 3. Key Statutory Safeguards & Rights
{rights}

### 4. Recommended Action Checklist
{steps}"""
    return {"analysis": fallback_analysis, "analyzed": True, "lang": lang}
