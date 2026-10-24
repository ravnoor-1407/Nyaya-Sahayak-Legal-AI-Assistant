import os, time
from dotenv import load_dotenv
load_dotenv()

SKIP = ("whisper", "guard", "tts", "embed", "image", "vision-preview", "audio", "imagen", "veo", "live")

print("=== GROQ (working chat models) ===")
working_groq = []
try:
    from groq import Groq
    g = Groq(api_key=os.getenv("GROQ_API_KEY"), timeout=20, max_retries=0)
    for m in g.models.list().data:
        if any(s in m.id.lower() for s in SKIP):
            continue
        try:
            t = time.time()
            g.chat.completions.create(model=m.id, max_tokens=5,
                                      messages=[{"role": "user", "content": "Say hi"}])
            print(f"OK   {m.id}  ({time.time()-t:.1f}s)")
            working_groq.append(m.id)
        except Exception as e:
            print(f"FAIL {m.id}: {str(e)[:80]}")
except Exception as e:
    print("Groq error:", e)

print("\n=== GEMINI (working models) ===")
working_gem = []
try:
    from google import genai
    from google.genai import types
    c = genai.Client(api_key=os.getenv("GEMINI_API_KEY"),
                     http_options=types.HttpOptions(timeout=20000))
    for m in c.models.list():
        name = m.name.replace("models/", "")
        if "flash" not in name or any(s in name.lower() for s in SKIP):
            continue
        try:
            t = time.time()
            c.models.generate_content(model=name, contents="Say hi")
            print(f"OK   {name}  ({time.time()-t:.1f}s)")
            working_gem.append(name)
        except Exception as e:
            print(f"FAIL {name}: {str(e)[:80]}")
except Exception as e:
    print("Gemini error:", e)

print("\nSuggested .env lines:")
print("GROQ_MODEL=" + ",".join(working_groq[:2]))
print("GEMINI_MODEL=" + ",".join(working_gem[:2]))