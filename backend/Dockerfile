FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and data
COPY . .

# Pre-build knowledge base chunks and ingest embeddings during build
# (Ensures Chroma vector DB is pre-indexed for fast container startup)
RUN python -m scripts.build_chunks && \
    python -m scripts.ingest

# Port is provided by environment on PaaS (Render, Railway, Hugging Face), default 8000
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
