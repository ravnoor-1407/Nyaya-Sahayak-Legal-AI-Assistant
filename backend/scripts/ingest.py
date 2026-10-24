import json, os
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv()

model = SentenceTransformer(os.getenv("EMBED_MODEL", "intfloat/multilingual-e5-base"))
client = chromadb.PersistentClient(path="data/chroma")
try:
    client.delete_collection("laws")
except Exception:
    pass
col = client.create_collection("laws", metadata={"hnsw:space": "cosine"})

chunks = [json.loads(l) for l in open("data/processed/chunks.jsonl", encoding="utf-8")]
B = 64
for i in range(0, len(chunks), B):
    batch = chunks[i:i + B]
    docs = [c["text"] for c in batch]
    emb = model.encode(["passage: " + f"{c['act']} {c['unit']} {c['section']} {c['title']}. {c['text']}"
                        for c in batch], normalize_embeddings=True).tolist()
    col.add(ids=[f"c{i+j}" for j in range(len(batch))], documents=docs, embeddings=emb,
            metadatas=[{k: v for k, v in c.items() if k != "text"} for c in batch])
    print(f"{min(i+B, len(chunks))}/{len(chunks)}")