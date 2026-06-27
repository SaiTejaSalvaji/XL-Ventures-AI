# Stage 1: Build Dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final Runtime
FROM python:3.12-slim AS runner

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend source
COPY app/ ./app/
COPY run.py .
COPY requirements.txt .

# Create volume/directories for SQL persistence and CSV downloads
RUN mkdir -p ./exports && chmod 777 ./exports

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["python", "run.py"]
