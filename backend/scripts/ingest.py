import json
import os
import sys
from pathlib import Path

# Force offline mode so huggingface loads directly from local cache without DNS timeouts
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = DATA_DIR / "chroma"
CHUNKS_FILE = DATA_DIR / "processed" / "chunks.jsonl"

embed_model_name = os.getenv("EMBED_MODEL", "intfloat/multilingual-e5-base")
print(f"Connecting to ChromaDB at {CHROMA_DIR}...", flush=True)

client = chromadb.PersistentClient(path=str(CHROMA_DIR))
col = client.get_or_create_collection("laws", metadata={"hnsw:space": "cosine"})

chunks = [json.loads(line) for line in open(CHUNKS_FILE, encoding="utf-8")]
total = len(chunks)
print(f"Total chunks in processed dataset: {total}", flush=True)

# Fetch currently indexed IDs
existing_ids = set()
try:
    existing_ids = set(col.get(include=[])["ids"])
except Exception:
    pass
print(f"Already indexed in ChromaDB: {len(existing_ids)}/{total} chunks.", flush=True)

# Filter missing chunks
missing_indices = [i for i in range(total) if f"c{i}" not in existing_ids]

if not missing_indices:
    print(f"\nAll {total} chunks are ALREADY fully indexed in ChromaDB! Nothing to do.", flush=True)
    sys.exit(0)

print(f"Encoding {len(missing_indices)} remaining chunks...", flush=True)
print(f"Loading embedding model: {embed_model_name}...", flush=True)
try:
    model = SentenceTransformer(embed_model_name, local_files_only=True)
except Exception:
    model = SentenceTransformer(embed_model_name)
print("Embedding model ready.", flush=True)

B = 64
for batch_start in range(0, len(missing_indices), B):
    batch_idx = missing_indices[batch_start : batch_start + B]
    batch_chunks = [chunks[i] for i in batch_idx]
    docs = [c["text"] for c in batch_chunks]
    passages = [f"passage: {c['act']} {c['unit']} {c['section']} {c['title']}. {c['text']}" for c in batch_chunks]
    emb = model.encode(passages, normalize_embeddings=True, show_progress_bar=False).tolist()
    col.add(
        ids=[f"c{i}" for i in batch_idx],
        documents=docs,
        embeddings=emb,
        metadatas=[{k: v for k, v in c.items() if k != "text"} for c in batch_chunks],
    )
    current_count = len(existing_ids) + min(batch_start + B, len(missing_indices))
    print(f"Progress: {current_count}/{total} chunks ({ (current_count / total) * 100:.1f}%)...", flush=True)

print(f"\nSUCCESS: Ingestion complete! All {total} chunks successfully indexed in ChromaDB.", flush=True)
