import json
import os
from collections import defaultdict
from datetime import datetime

import pandas as pd

from app import rag

K = 5
SWITCHES = ("USE_KEYWORD", "USE_SECTION", "USE_TITLE",
            "USE_MAPPING", "USE_TRANSLATE")

chunks = [json.loads(l) for l in
          open("data/processed/chunks.jsonl", encoding="utf-8")]
have = {(c["act"], c["section"]) for c in chunks}

df = pd.read_csv("data/eval.csv", dtype=str, encoding="utf-8-sig").fillna("")
ins = df[df.in_scope == "1"]
out = df[df.in_scope == "0"]

has_data = ins.apply(
    lambda r: (r.expected_act, r.expected_section) in have, axis=1)
skipped = ins[~has_data]
ins = ins[has_data]

hit = {1: 0, 3: 0, 5: 0}
rr = 0.0
by_lang = defaultdict(lambda: [0, 0])
fails = []

for _, r in ins.iterrows():
    hits = rag.retrieve(r.question, k=K)
    rank = None
    for i, h in enumerate(hits):
        if h["act"] == r.expected_act and h["section"] == r.expected_section:
            rank = i + 1
            break
    for k in hit:
        if rank and rank <= k:
            hit[k] += 1
    rr += 1 / rank if rank else 0
    by_lang[r.lang][1] += 1
    if rank and rank <= 3:
        by_lang[r.lang][0] += 1
    else:
        got = [h["act"].split(",")[0] + " " + h["section"] for h in hits[:3]]
        fails.append((r.question, r.expected_act.split(",")[0],
                      r.expected_section, rank, got))

n = len(ins)
if n == 0:
    raise SystemExit("No in-scope questions found in data/eval.csv")

refused = 0
wrongly_answered = []
for q in out.question:
    best = min(h["distance"] for h in rag.retrieve(q, k=8))
    if best > rag.MAX_DIST:
        refused += 1
    else:
        wrongly_answered.append((q, round(best, 3)))

print("\n========== RESULTS ==========")
print("In-scope questions evaluated:", n)
print("Skipped (expected section missing from data):", len(skipped))
for k in hit:
    print("Hit@%d: %.1f%%" % (k, 100 * hit[k] / n))
print("MRR: %.3f" % (rr / n))
print("\nHit@3 by language:")
for lang, (h, t) in by_lang.items():
    print("  %s: %d/%d = %.0f%%" % (lang, h, t, 100 * h / t))
print("\nOut-of-scope refused: %d/%d  (MAX_DIST=%s)"
      % (refused, len(out), rag.MAX_DIST))
for q, d in wrongly_answered:
    print("  answered but should refuse:", q, "| closest distance", d)

print("\n========== FAILURES (not in top 3) ==========")
for q, act, sec, rank, got in fails:
    print("- %s\n    expected %s %s | rank %s | got %s" % (q, act, sec, rank, got))

full_system = all(os.getenv(s, "1") == "1" for s in SWITCHES)
if full_system:
    result = {
        "n": n,
        "skipped": len(skipped),
        "hit1": round(hit[1] / n, 4),
        "hit3": round(hit[3] / n, 4),
        "hit5": round(hit[5] / n, 4),
        "mrr": round(rr / n, 4),
        "refused": refused,
        "out_total": len(out),
        "max_dist": rag.MAX_DIST,
        "by_lang": {l: round(h / t, 3) for l, (h, t) in by_lang.items()},
        "date": datetime.now().strftime("%Y-%m-%d"),
    }
    with open("data/eval_results.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print("\nSaved data/eval_results.json (the Safety Charter page reads this).")
else:
    print("\nAblation run: results NOT saved to eval_results.json.")