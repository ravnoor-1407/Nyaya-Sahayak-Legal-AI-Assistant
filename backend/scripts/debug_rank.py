import sys

from app import rag

q = sys.argv[1]
act_prefix = sys.argv[2]
sec = sys.argv[3]

idxs = [i for i, c in enumerate(rag.CHUNKS)
        if c["act"].startswith(act_prefix) and c["section"] == sec]
print("chunks found:", len(idxs))
for i in idxs:
    c = rag.CHUNKS[i]
    print("  title:", repr(c["title"][:100]))
    print("  text length:", len(c["text"]))
    print("  text start:", c["text"][:160].replace("\n", " "))

q_en = rag.to_english(q)
print("english query:", q_en)

emb = rag.model.encode(["query: " + q_en], normalize_embeddings=True)
r = rag.col.query(query_embeddings=emb.tolist(), n_results=200)
dense_ids = [int(x[1:]) for x in r["ids"][0]]
for i in idxs:
    pos = dense_ids.index(i) + 1 if i in dense_ids else ">200"
    print("dense rank:", pos)

sims = (rag.MATRIX @ rag.TFIDF.transform([q_en]).T).toarray().ravel()
order = list(sims.argsort()[::-1])
for i in idxs:
    print("keyword rank:", order.index(i) + 1, "| score", round(float(sims[i]), 3))

print("\nfinal top 8:")
for h in rag.retrieve(q, k=8):
    print("  ", h["act"].split(",")[0], h["section"], "|", h["title"][:60])