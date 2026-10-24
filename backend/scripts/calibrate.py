import pandas as pd

from app import rag

df = pd.read_csv("data/eval.csv", dtype=str, encoding="utf-8-sig").fillna("")
ins, out = [], []
for _, r in df.iterrows():
    best = min(h["distance"] for h in rag.retrieve(r.question, k=8))
    if r.in_scope == "1":
        ins.append(best)
    else:
        out.append(best)
ins.sort()
out.sort()


def show(name, v):
    print("%-14s min %.3f | median %.3f | max %.3f"
          % (name, v[0], v[len(v) // 2], v[-1]))


show("in-scope", ins)
show("out-of-scope", out)
print("\nthreshold | out-of-scope refused | in-scope wrongly refused")
best_t, best_s = 0.3, -9
for t in [x / 100 for x in range(10, 41)]:
    ro = sum(b > t for b in out)
    ri = sum(b > t for b in ins)
    s = ro / len(out) - ri / len(ins)
    print("  %.2f    |   %d/%d              |   %d/%d"
          % (t, ro, len(out), ri, len(ins)))
    if s > best_s:
        best_t, best_s = t, s
print("\nSuggested MAX_DIST =", best_t)