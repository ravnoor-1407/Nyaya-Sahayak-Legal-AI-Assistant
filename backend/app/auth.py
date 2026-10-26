import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import smtplib
import sqlite3
import time
import urllib.parse
import urllib.request
from email.message import EmailMessage
from typing import Any, cast

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

load_dotenv()

DB_PATH = "data/app.db"
SESSION_SECONDS = 30 * 24 * 3600
OTP_EXPIRY_SECONDS = 10 * 60  # 10 minutes
ITERATIONS = 200_000
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")
PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")

router = APIRouter(prefix="/api/auth")
_FAILS: dict[str, list[float]] = {}


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
    c.execute("CREATE TABLE IF NOT EXISTS otps("
              "target TEXT PRIMARY KEY, code TEXT, type TEXT, "
              "name TEXT, created REAL, attempts INT)")

    cols = _cols(c, "users")
    if "phone" not in cols:
        c.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        c.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL")

    for table in ("queries", "feedback", "cites"):
        if "user_id" not in _cols(c, table):
            c.execute("ALTER TABLE " + table + " ADD COLUMN user_id INTEGER")
    return c


def _hash(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex),
        ITERATIONS).hex()


def _strong(pw: str) -> bool:
    return bool(8 <= len(pw) <= 128 and re.search(r"[A-Za-z]", pw)
                and re.search(r"\d", pw))


def _blocked(key: str) -> bool:
    now = time.time()
    hits: list[float] = [t for t in _FAILS.get(key, []) if now - t < 600]
    _FAILS[key] = hits
    return len(hits) >= 8


def _fail(key: str) -> None:
    _FAILS.setdefault(key, []).append(time.time())


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


# ===================== Professional Email Template =====================

def _build_email_html(code: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your NyayaSahayak Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07101e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 540px; margin: 30px auto; background-color: #0b1b3a; border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 16px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0b1f4d 100%); padding: 26px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
      <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">NyayaSahayak <span style="font-size: 15px; color: #cbd5e1; font-weight: normal;">(न्याय सहायक)</span></h1>
      <p style="color: #94a3b8; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Citizen Legal Empowerment Portal · Articles 21 & 39A</p>
    </div>
    <div style="padding: 34px 28px; text-align: center;">
      <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700;">Account Verification Code</h2>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">Please use the 6-digit code below to sign in or create your account on NyayaSahayak:</p>
      
      <div style="display: inline-block; background-color: #071224; border: 2px dashed #f59e0b; border-radius: 12px; padding: 16px 36px; margin-bottom: 24px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #f59e0b;">{code}</span>
      </div>
      
      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px;">⏱️ This code will expire in <b>10 minutes</b>.</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">For your security, never share this code or your password with anyone.</p>
    </div>
    <div style="background-color: #071224; padding: 18px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 11px; line-height: 1.5;">
      <p style="margin: 0;">NyayaSahayak — A digital public legal good ensuring equal justice under law accessible to every citizen.</p>
      <p style="margin: 4px 0 0;">If you did not request this verification code, please ignore this email.</p>
    </div>
  </div>
</body>
</html>"""


# ===================== Real-time Email & SMS Sender Services =====================

def _send_email_otp(email: str, code: str) -> dict[str, Any]:
    html_content = _build_email_html(code)

    # 1. Resend API (https://resend.com)
    resend_key = os.getenv("RESEND_API_KEY", "").strip()
    if resend_key:
        try:
            payload = {
                "from": os.getenv("RESEND_FROM", "NyayaSahayak <onboarding@resend.dev>"),
                "to": [email],
                "subject": f"Your NyayaSahayak Verification Code: {code}",
                "html": html_content
            }
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "NyayaSahayak-App"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[AUTH EMAIL] Successfully delivered OTP via Resend to {email}")
                    return {"sent": True, "provider": "resend"}
        except Exception as ex:
            print(f"[AUTH EMAIL ERROR - Resend]: {ex}")

    # 2. Brevo (Sendinblue) API (300 free emails/day: https://brevo.com)
    brevo_key = os.getenv("BREVO_API_KEY", "").strip() or os.getenv("SENDINBLUE_API_KEY", "").strip()
    if brevo_key:
        try:
            sender_email = (
                os.getenv("BREVO_FROM", "").strip()
                or os.getenv("SMTP_FROM", "").strip()
                or os.getenv("SMTP_USER", "").strip()
                or "verify@nyayasahayak.gov.in"
            )
            payload = {
                "sender": {"name": "NyayaSahayak", "email": sender_email},
                "to": [{"email": email}],
                "subject": f"Your NyayaSahayak Verification Code: {code}",
                "htmlContent": html_content,
                "textContent": f"Your NyayaSahayak verification code is: {code}\n\nValid for 10 minutes."
            }
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "api-key": brevo_key,
                    "Content-Type": "application/json",
                    "User-Agent": "NyayaSahayak-App"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201, 202):
                    print(f"[AUTH EMAIL] Successfully delivered OTP via Brevo to {email}")
                    return {"sent": True, "provider": "brevo"}
        except Exception as ex:
            print(f"[AUTH EMAIL ERROR - Brevo]: {ex}")

    # 3. SendGrid API
    sendgrid_key = os.getenv("SENDGRID_API_KEY", "").strip()
    if sendgrid_key:
        try:
            payload = {
                "personalizations": [{"to": [{"email": email}]}],
                "from": {"email": os.getenv("SENDGRID_FROM", "verify@nyayasahayak.gov.in"), "name": "NyayaSahayak"},
                "subject": f"Your NyayaSahayak Verification Code: {code}",
                "content": [
                    {"type": "text/plain", "value": f"Your NyayaSahayak verification code is: {code}\n\nValid for 10 minutes."},
                    {"type": "text/html", "value": html_content}
                ]
            }
            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "NyayaSahayak-App"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201, 202):
                    print(f"[AUTH EMAIL] Successfully delivered OTP via SendGrid to {email}")
                    return {"sent": True, "provider": "sendgrid"}
        except Exception as ex:
            print(f"[AUTH EMAIL ERROR - SendGrid]: {ex}")

    # 4. Standard SMTP (Gmail App Password, Custom SMTP Server, AWS SES)
    load_dotenv(override=True)
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_host = os.getenv("SMTP_HOST", "").strip() or ("smtp.gmail.com" if smtp_user else "")
    if smtp_host:
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_pw = os.getenv("SMTP_PASSWORD", "").strip().replace(" ", "")
            smtp_from = os.getenv("SMTP_FROM", smtp_user or "noreply@nyayasahayak.gov.in")
            
            msg = EmailMessage()
            msg["Subject"] = f"Your NyayaSahayak Verification Code: {code}"
            msg["From"] = f"NyayaSahayak <{smtp_from}>" if "<" not in smtp_from else smtp_from
            msg["To"] = email
            msg.set_content(f"Your NyayaSahayak verification code is: {code}\n\nThis code is valid for 10 minutes.\nNever share this code.")
            msg.add_alternative(html_content, subtype="html")

            if smtp_port == 465:
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=5) as s:
                    if smtp_user and smtp_pw:
                        s.login(smtp_user, smtp_pw)
                    s.send_message(msg)
            else:
                with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as s:
                    s.ehlo()
                    s.starttls()
                    s.ehlo()
                    if smtp_user and smtp_pw:
                        s.login(smtp_user, smtp_pw)
                    s.send_message(msg)
            print(f"[AUTH EMAIL] Successfully delivered OTP via SMTP ({smtp_host}) to {email}")
            return {"sent": True, "provider": "smtp"}
        except Exception as ex:
            print(f"[AUTH EMAIL ERROR - SMTP]: {ex}")

    # 5. Fallback in development mode
    print(f"[AUTH EMAIL REALTIME]: OTP code for {email} is {code}")
    return {"sent": False, "provider": "realtime_toast"}


def _has_sms_provider() -> bool:
    fast2sms = bool(os.getenv("FAST2SMS_API_KEY", "").strip())
    twilio = bool(
        os.getenv("TWILIO_ACCOUNT_SID", "").strip()
        and os.getenv("TWILIO_AUTH_TOKEN", "").strip()
        and os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    )
    return fast2sms or twilio


def _send_sms_otp(phone: str, code: str) -> dict[str, Any]:
    # 1. Twilio (https://www.twilio.com)
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    twilio_from = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    if twilio_sid and twilio_token and twilio_from:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            data = urllib.parse.urlencode({
                "From": twilio_from,
                "To": phone,
                "Body": f"Your NyayaSahayak verification code is {code}. Valid for 10 minutes."
            }).encode("utf-8")
            auth_header = "Basic " + base64.b64encode(f"{twilio_sid}:{twilio_token}".encode("utf-8")).decode("ascii")
            req = urllib.request.Request(url, data=data, headers={"Authorization": auth_header, "User-Agent": "NyayaSahayak-App"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[AUTH SMS] Successfully delivered OTP via Twilio to {phone}")
                    return {"sent": True, "provider": "twilio"}
        except Exception as ex:
            print(f"[AUTH SMS ERROR - Twilio]: {ex}")

    # 2. Fast2SMS (for India numbers: https://www.fast2sms.com)
    fast2sms_key = os.getenv("FAST2SMS_API_KEY", "").strip()
    if fast2sms_key:
        try:
            digits = re.sub(r"\D", "", phone)[-10:]
            payload = {
                "route": "otp",
                "variables_values": code,
                "numbers": digits
            }
            req = urllib.request.Request(
                "https://www.fast2sms.com/dev/bulkV2",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "authorization": fast2sms_key,
                    "Content-Type": "application/json",
                    "User-Agent": "NyayaSahayak-App"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_text = resp.read().decode("utf-8")
                try:
                    resp_json = json.loads(resp_text)
                except Exception:
                    resp_json = {}
                if resp.status == 200 and resp_json.get("return") is True:
                    print(f"[AUTH SMS] Successfully delivered OTP via Fast2SMS to {phone}: {resp_json}")
                    return {"sent": True, "provider": "fast2sms"}
                else:
                    print(f"[AUTH SMS ERROR - Fast2SMS response]: Status {resp.status} - {resp_text}")
        except Exception as ex:
            print(f"[AUTH SMS ERROR - Fast2SMS]: {ex}")

    # 3. Fallback preview
    print(f"[AUTH SMS REALTIME]: OTP code for {phone} is {code}")
    return {"sent": False, "provider": "realtime_toast"}


def _clean_phone(raw: str) -> str:
    cleaned = re.sub(r"[\s\-\(\)]", "", raw.strip())
    if not cleaned.startswith("+"):
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        else:
            cleaned = "+" + cleaned
    return cleaned


def _is_production() -> bool:
    env = os.getenv("ENVIRONMENT", "").lower() or os.getenv("NODE_ENV", "").lower()
    return env in ("production", "prod")


def _allow_debug_otp() -> bool:
    if _is_production():
        return False
    return os.getenv("DEBUG_OTP", "true").lower() == "true"


# ===================== Request Models =====================

class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class EmailOtpSendIn(BaseModel):
    email: str
    name: str | None = None


class EmailOtpVerifyIn(BaseModel):
    email: str
    code: str
    name: str | None = None


class PhoneOtpSendIn(BaseModel):
    phone: str
    name: str | None = None


class PhoneOtpVerifyIn(BaseModel):
    phone: str
    code: str
    name: str | None = None


class GoogleAuthIn(BaseModel):
    credential: str | None = None
    email: str
    name: str | None = None


class FirebasePhoneAuthIn(BaseModel):
    phone: str
    name: str | None = None
    id_token: str | None = None


# ===================== Routes =====================

@router.post("/register")
def register(b: RegisterIn) -> dict[str, object]:
    name = " ".join(b.name.split())
    email = b.email.strip().lower()
    if not 2 <= len(name) <= 60:
        raise HTTPException(400, "bad_name")
    if len(email) > 120 or not EMAIL_RE.match(email):
        raise HTTPException(400, "invalid_email")
    if not _strong(b.password):
        raise HTTPException(400, "weak_password")
    salt = secrets.token_hex(16)
    try:
        with db() as c:
            cur = c.execute(
                "INSERT INTO users(name,email,salt,pw,created) "
                "VALUES(?,?,?,?,?)",
                (name, email, salt, _hash(b.password, salt), time.time()))
            uid = cast(int, cur.lastrowid)
    except sqlite3.IntegrityError:
        raise HTTPException(409, "email_taken")
    return {"token": _new_session(uid),
            "user": {"id": uid, "name": name, "email": email}}


@router.post("/login")
def login(b: LoginIn) -> dict[str, object]:
    email = b.email.strip().lower()
    if _blocked(email):
        raise HTTPException(429, "too_many")
    with db() as c:
        row = cast(tuple[int, str, str, str] | None, c.execute(
            "SELECT id, name, salt, pw FROM users WHERE email = ?",
            (email,)).fetchone())
    if row:
        ok = hmac.compare_digest(_hash(b.password[:128], row[2]), row[3])
    else:
        _hash(b.password[:128], "00" * 16)  # same work, no timing leak
        ok = False
    if not ok:
        _fail(email)
        raise HTTPException(401, "bad_credentials")
    return {"token": _new_session(row[0]),
            "user": {"id": row[0], "name": row[1], "email": email}}


@router.post("/email-otp/send")
def send_email_otp(b: EmailOtpSendIn) -> dict[str, Any]:
    email = b.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(400, "invalid_email")
    code = f"{secrets.randbelow(900000) + 100000}"
    with db() as c:
        c.execute(
            "INSERT OR REPLACE INTO otps(target, code, type, name, created, attempts) "
            "VALUES(?, ?, 'email', ?, ?, 0)",
            (email, code, (b.name or "").strip(), time.time())
        )
    res = _send_email_otp(email, code)

    response_data: dict[str, Any] = {
        "ok": True,
        "message": f"Verification code sent to {email}",
        "sent_to": email,
        "provider": res["provider"]
    }
    # If external email dispatch didn't succeed (e.g. cloud host blocked SMTP) or debug mode enabled:
    if not res.get("sent") or _allow_debug_otp():
        response_data["debug_code"] = code
        if not res.get("sent"):
            response_data["notice"] = (
                "Live email dispatch unavailable on current cloud host. Real-time verification code enabled."
            )

    return response_data


@router.post("/email-otp/verify")
def verify_email_otp(b: EmailOtpVerifyIn) -> dict[str, Any]:
    email = b.email.strip().lower()
    code = b.code.strip()
    with db() as c:
        row = c.execute("SELECT code, name, created, attempts FROM otps WHERE target = ?", (email,)).fetchone()
        if not row:
            raise HTTPException(400, "otp_expired_or_not_found")
        expected_code, saved_name, created_ts, attempts = row
        if time.time() - created_ts > OTP_EXPIRY_SECONDS:
            c.execute("DELETE FROM otps WHERE target = ?", (email,))
            raise HTTPException(400, "otp_expired")
        if attempts >= 5:
            c.execute("DELETE FROM otps WHERE target = ?", (email,))
            raise HTTPException(429, "too_many_attempts")
        if not hmac.compare_digest(str(expected_code), code):
            c.execute("UPDATE otps SET attempts = attempts + 1 WHERE target = ?", (email,))
            raise HTTPException(400, "invalid_code")

        c.execute("DELETE FROM otps WHERE target = ?", (email,))

        user_row = c.execute("SELECT id, name, email FROM users WHERE email = ?", (email,)).fetchone()
        if user_row:
            uid, user_name, user_email = user_row
            if b.name and b.name.strip() and not user_name:
                user_name = b.name.strip()
                c.execute("UPDATE users SET name = ? WHERE id = ?", (user_name, uid))
        else:
            cand_name = (b.name or saved_name or "").strip()
            if not cand_name:
                cand_name = email.split("@")[0].replace(".", " ").capitalize()
            cur = c.execute(
                "INSERT INTO users(name, email, salt, pw, created) VALUES(?, ?, '', '', ?)",
                (cand_name, email, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = cand_name
            user_email = email

    token = _new_session(uid)
    return {
        "token": token,
        "user": {"id": uid, "name": user_name, "email": user_email}
    }


@router.post("/phone-otp/send")
def send_phone_otp(b: PhoneOtpSendIn) -> dict[str, Any]:
    phone = _clean_phone(b.phone)
    if not PHONE_RE.match(phone):
        raise HTTPException(400, "invalid_phone")
    code = f"{secrets.randbelow(900000) + 100000}"
    with db() as c:
        c.execute(
            "INSERT OR REPLACE INTO otps(target, code, type, name, created, attempts) "
            "VALUES(?, ?, 'phone', ?, ?, 0)",
            (phone, code, (b.name or "").strip(), time.time())
        )

    has_provider = _has_sms_provider()
    res = _send_sms_otp(phone, code)

    # Only throw error if the administrator configured an SMS gateway and delivery failed
    if has_provider and _is_production() and not res.get("sent"):
        raise HTTPException(500, "sms_delivery_failed")

    response_data: dict[str, Any] = {
        "ok": True,
        "message": f"Verification code sent to {phone}",
        "sent_to": phone,
        "provider": res["provider"]
    }
    # If no physical SMS gateway key is configured or debug OTP is enabled, return debug_code so user is never blocked
    if not has_provider or _allow_debug_otp():
        response_data["debug_code"] = code
        if not has_provider:
            response_data["sms_gateway_missing"] = True
            response_data["notice"] = (
                "SMS gateway (FAST2SMS_API_KEY) not set in backend/.env. Real-time preview code enabled."
            )

    return response_data


@router.post("/phone-otp/verify")
def verify_phone_otp(b: PhoneOtpVerifyIn) -> dict[str, Any]:
    phone = _clean_phone(b.phone)
    code = b.code.strip()
    with db() as c:
        row = c.execute("SELECT code, name, created, attempts FROM otps WHERE target = ?", (phone,)).fetchone()
        if not row:
            raise HTTPException(400, "otp_expired_or_not_found")
        expected_code, saved_name, created_ts, attempts = row
        if time.time() - created_ts > OTP_EXPIRY_SECONDS:
            c.execute("DELETE FROM otps WHERE target = ?", (phone,))
            raise HTTPException(400, "otp_expired")
        if attempts >= 5:
            c.execute("DELETE FROM otps WHERE target = ?", (phone,))
            raise HTTPException(429, "too_many_attempts")
        if not hmac.compare_digest(str(expected_code), code):
            c.execute("UPDATE otps SET attempts = attempts + 1 WHERE target = ?", (phone,))
            raise HTTPException(400, "invalid_code")

        c.execute("DELETE FROM otps WHERE target = ?", (phone,))

        user_row = c.execute("SELECT id, name, email, phone FROM users WHERE phone = ?", (phone,)).fetchone()
        if user_row:
            uid, user_name, user_email, _ = user_row
            if b.name and b.name.strip() and not user_name:
                user_name = b.name.strip()
                c.execute("UPDATE users SET name = ? WHERE id = ?", (user_name, uid))
        else:
            cand_name = (b.name or saved_name or "").strip()
            if not cand_name:
                cand_name = f"Citizen {phone[-4:]}"
            pseudo_email = f"{phone.replace('+', '')}@phone.nyayasahayak.gov.in"
            cur = c.execute(
                "INSERT INTO users(name, email, phone, salt, pw, created) VALUES(?, ?, ?, '', '', ?)",
                (cand_name, pseudo_email, phone, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = cand_name
            user_email = pseudo_email

    token = _new_session(uid)
    return {
        "token": token,
        "user": {"id": uid, "name": user_name, "email": user_email, "phone": phone}
    }


@router.post("/google")
def google_auth(b: GoogleAuthIn) -> dict[str, Any]:
    email = b.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(400, "invalid_email")
    name = (b.name or "").strip()
    if not name:
        name = email.split("@")[0].replace(".", " ").capitalize()

    with db() as c:
        row = c.execute("SELECT id, name, email FROM users WHERE email = ?", (email,)).fetchone()
        if row:
            uid, user_name, user_email = row
            if name and not user_name:
                user_name = name
                c.execute("UPDATE users SET name = ? WHERE id = ?", (user_name, uid))
        else:
            cur = c.execute(
                "INSERT INTO users(name, email, salt, pw, created) VALUES(?, ?, '', '', ?)",
                (name, email, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = name
            user_email = email

    token = _new_session(uid)
    return {
        "token": token,
        "user": {"id": uid, "name": user_name, "email": user_email}
    }


@router.post("/firebase-phone")
def firebase_phone_auth(b: FirebasePhoneAuthIn) -> dict[str, Any]:
    phone = _clean_phone(b.phone)
    if not PHONE_RE.match(phone):
        raise HTTPException(400, "invalid_phone")
    cand_name = (b.name or "").strip()
    if not cand_name:
        cand_name = f"Citizen {phone[-4:]}"
    pseudo_email = f"{phone.replace('+', '')}@phone.nyayasahayak.gov.in"

    with db() as c:
        user_row = c.execute("SELECT id, name, email, phone FROM users WHERE phone = ?", (phone,)).fetchone()
        if user_row:
            uid, user_name, user_email, _ = user_row
            if cand_name and not user_name:
                user_name = cand_name
                c.execute("UPDATE users SET name = ? WHERE id = ?", (user_name, uid))
        else:
            cur = c.execute(
                "INSERT INTO users(name, email, phone, salt, pw, created) VALUES(?, ?, ?, '', '', ?)",
                (cand_name, pseudo_email, phone, time.time())
            )
            uid = cast(int, cur.lastrowid)
            user_name = cand_name
            user_email = pseudo_email

    token = _new_session(uid)
    return {
        "token": token,
        "user": {"id": uid, "name": user_name, "email": user_email, "phone": phone}
    }


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
