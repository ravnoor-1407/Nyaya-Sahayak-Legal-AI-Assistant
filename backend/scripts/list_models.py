import os
from dotenv import load_dotenv
load_dotenv()

print("=== GEMINI ===")
try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    for m in client.models.list():
        if "flash" in m.name or "pro" in m.name:
            print(m.name)
except Exception as e:
    print("Gemini error:", e)

print("\n=== GROQ ===")
try:
    from groq import Groq
    g = Groq(api_key=os.getenv("GROQ_API_KEY"))
    for m in g.models.list().data:
        print(m.id)
except Exception as e:
    print("Groq error:", e)