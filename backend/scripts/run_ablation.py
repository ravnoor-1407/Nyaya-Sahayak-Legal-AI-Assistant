import os
import sys
import json
import pandas as pd
from collections import defaultdict

# Add backend directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import rag

chunks = [json.loads(l) for l in open("data/processed/chunks.jsonl", encoding="utf-8")]
have = {(c["act"], c["section"]) for c in chunks}

df = pd.read_csv("data/eval.csv", dtype=str, encoding="utf-8-sig").fillna("")
ins = df[df.in_scope == "1"]
has_data = ins.apply(lambda r: (r.expected_act, r.expected_section) in have, axis=1)
ins = ins[has_data]
n = len(ins)

configs = [
    {
        "name": "A. Vector search only",
        "switches": {"USE_KEYWORD": False, "USE_SECTION": False, "USE_TITLE": False, "USE_MAPPING": False, "USE_TRANSLATE": False}
    },
    {
        "name": "B. + keyword and act-aware section matching",
        "switches": {"USE_KEYWORD": True, "USE_SECTION": True, "USE_TITLE": False, "USE_MAPPING": False, "USE_TRANSLATE": False}
    },
    {
        "name": "C. + title matching",
        "switches": {"USE_KEYWORD": True, "USE_SECTION": True, "USE_TITLE": True, "USE_MAPPING": False, "USE_TRANSLATE": False}
    },
    {
        "name": "D. + IPC-to-BNS mapping expansion",
        "switches": {"USE_KEYWORD": True, "USE_SECTION": True, "USE_TITLE": True, "USE_MAPPING": True, "USE_TRANSLATE": False}
    },
    {
        "name": "E. + query translation for Hindi and Punjabi",
        "switches": {"USE_KEYWORD": True, "USE_SECTION": True, "USE_TITLE": True, "USE_MAPPING": True, "USE_TRANSLATE": True}
    },
]

results = []

for cfg in configs:
    # Set switches in rag module
    rag.USE_KEYWORD = cfg["switches"]["USE_KEYWORD"]
    rag.USE_SECTION = cfg["switches"]["USE_SECTION"]
    rag.USE_TITLE = cfg["switches"]["USE_TITLE"]
    rag.USE_MAPPING = cfg["switches"]["USE_MAPPING"]
    rag.USE_TRANSLATE = cfg["switches"]["USE_TRANSLATE"]

    hit3 = 0
    rr = 0.0

    for _, r in ins.iterrows():
        hits = rag.retrieve(r.question, k=5)
        rank = None
        for i, h in enumerate(hits):
            if h["act"] == r.expected_act and h["section"] == r.expected_section:
                rank = i + 1
                break
        if rank and rank <= 3:
            hit3 += 1
        rr += 1 / rank if rank else 0

    hit3_pct = (hit3 / n) * 100
    mrr = rr / n
    results.append({
        "name": cfg["name"],
        "hit3": f"{hit3_pct:.1f}%",
        "mrr": f"{mrr:.3f}"
    })
    print(f"{cfg['name']}: Hit@3 = {hit3_pct:.1f}%, MRR = {mrr:.3f}")

print("\n--- FINAL ABLATION TABLE ---")
print("| Configuration | Hit@3 | MRR |")
print("|---|---|---|")
print("| Original baseline (before the title-column fix) | 57.8% | 0.503 |")
for r in results:
    print(f"| {r['name']} | {r['hit3']} | {r['mrr']} |")
