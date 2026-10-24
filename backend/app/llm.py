import os
import time
from dotenv import load_dotenv

load_dotenv()

TIMEOUT = 60  # seconds per call
TEMPORARY = ("503", "504", "UNAVAILABLE", "DEADLINE", "429",
             "RESOURCE_EXHAUSTED", "overloaded", "timed out", "Timeout")


def _gemini(prompt, model):
    from google import genai
    from google.genai import types
    opts = types.HttpOptions(timeout=TIMEOUT * 1000)
    key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=key, http_options=opts)
    r = client.models.generate_content(model=model, contents=prompt)
    return r.text


def _groq(prompt, model):
    from groq import Groq
    key = os.getenv("GROQ_API_KEY")
    c = Groq(api_key=key, timeout=TIMEOUT, max_retries=0)
    msgs = [{"role": "user", "content": prompt}]
    r = c.chat.completions.create(model=model, messages=msgs,
                                  temperature=0.2)
    return r.choices[0].message.content


def _models(env_name):
    raw = os.getenv(env_name, "")
    return [m.strip() for m in raw.split(",") if m.strip()]


def _attempts():
    gem = [("gemini", m) for m in _models("GEMINI_MODEL")]
    grq = [("groq", m) for m in _models("GROQ_MODEL")]
    if os.getenv("PRIMARY", "gemini") == "gemini":
        return gem + grq
    return grq + gem


def generate(prompt):
    errors = []
    for provider, model in _attempts():
        fn = _gemini if provider == "gemini" else _groq
        tag = provider + "/" + model
        for attempt in range(2):
            try:
                text = fn(prompt, model)
                if text:
                    return text
                errors.append(tag + ": empty response")
                break
            except Exception as e:
                msg = str(e)
                errors.append(tag + ": " + msg[:200])
                temporary = any(x in msg for x in TEMPORARY)
                if temporary and attempt == 0:
                    time.sleep(2)
                    continue
                break
    raise RuntimeError(" || ".join(errors))