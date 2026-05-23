# ================================================================
# FinFlow Backend Dockerfile
# ================================================================

FROM python:3.11-slim AS base

# System dependencies (minimal set for dev)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Development (used by docker-compose) ─────────────────────
FROM base AS development

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ── Production ────────────────────────────────────────────────
FROM base AS production

RUN apt-get update && apt-get install -y \
    gcc libpq-dev tesseract-ocr tesseract-ocr-hin \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

RUN useradd --create-home --shell /bin/bash appuser

# Create upload dirs as root, then hand ownership to appuser
RUN mkdir -p uploads/documents uploads/temp && \
    chown -R appuser:appuser /app

USER appuser

COPY --chown=appuser:appuser . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
