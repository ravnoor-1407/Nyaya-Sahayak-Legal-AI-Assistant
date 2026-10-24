import json
import pandas as pd

print("=== CSV ===")
df = pd.read_csv("data/raw/bns.csv", dtype=str, encoding_errors="ignore").fillna("")
print("Columns:", list(df.columns))
print("Rows:", len(df))
print(df.head(3).to_string()[:1200])
mask = df.apply(lambda r: "said to commit theft" in " ".join(r.values).lower(), axis=1)
print("\nCSV rows defining theft:", int(mask.sum()))
print(df[mask].to_string()[:1500])

print("\n=== chunks.jsonl ===")
rows = [json.loads(l) for l in open("data/processed/chunks.jsonl", encoding="utf-8")]
bns = [r for r in rows if "Nyaya" in r["act"]]
print("BNS chunks:", len(bns))
print("BNS chunks with empty title:", sum(1 for r in bns if not r["title"].strip()))
print("First 15 section labels:", [r["section"] for r in bns[:15]])
hit = [r for r in bns if "said to commit theft" in r["text"].lower()]
print("Chunks defining theft:", len(hit))
for r in hit[:3]:
    print("  section =", repr(r["section"]), "| title =", repr(r["title"]))
    print("  text    =", r["text"][:250].replace("\n", " "))