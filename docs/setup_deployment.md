---
title: "Setup & Deployment Guide"
description: "How to set up, run, and deploy VenturePilot AI"
---

# VenturePilot AI — Setup & Deployment Guide

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Python** | ≥ 3.11 | Backend runtime |
| **Node.js** | ≥ 18.x | Frontend build tooling |
| **npm** | ≥ 9.x | Frontend package manager |
| **Git** | Any | Version control |

## 1. Clone the Repository

```bash
git clone https://github.com/SaiTejaSalvaji/XL-Ventures-AI.git
cd XL-Ventures-AI
```

## 2. Backend Setup

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```ini
# Required — at least one LLM provider
GROQ_API_KEY=gsk_your_groq_key_here          # Primary LLM (get at https://console.groq.com)
GEMINI_API_KEY=AIza...                        # Fallback LLM (get at https://aistudio.google.com/apikey)

# Optional — enhance with real data
GITHUB_TOKEN=ghp_...                          # https://github.com/settings/tokens
NEWSAPI_KEY=...                               # https://newsapi.org/register
GOOGLE_CSE_API_KEY=...                        # https://console.cloud.google.com
GOOGLE_CSE_ID=...                             # https://programmablesearchengine.google.com
```

> **Demo works without all keys** — agents fall back to smart mock data when external APIs are unavailable.

### Start the Backend Server

```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify it's running:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"VenturePilot AI","version":"1.0.0"}
```

Auto-generated API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: [http://localhost:5173](http://localhost:5173)

### Environment Variables (Frontend)

Create `frontend/.env` if you need to change the backend URL:

```ini
VITE_API_BASE_URL=http://localhost:8000
```

## 4. Run Tests

```bash
# From the project root
python -m pytest tests/ -v
```

Expected output: `18 passed` with coverage report.

## 5. Production Build (Frontend)

```bash
cd frontend
npm run build
```

The production bundle will be in `frontend/dist/`.

---

## API Keys Guide

### Groq (Primary LLM) — Recommended
1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign in or create a free account
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)
5. Set `GROQ_API_KEY=gsk_...` in `.env`

**Free tier limits**: 14,400 requests/day, 30 RPM

### Google Gemini (Fallback LLM)
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Set `GEMINI_API_KEY=AIza...` in `.env`

**Free tier limits**: 15 RPM, 1,500 RPD (AI Studio) or 20 RPD (GCP sandbox)

### GitHub Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate a classic token with `public_repo` scope
3. Set `GITHUB_TOKEN=ghp_...` in `.env`

### NewsAPI
1. Go to [newsapi.org/register](https://newsapi.org/register)
2. Register for a free account
3. Copy your API key
4. Set `NEWSAPI_KEY=...` in `.env`

---

## Project Structure

```
XL-Ventures-AI/
├── src/                          # Python backend
│   ├── __init__.py
│   ├── main.py                   # FastAPI application
│   ├── llm.py                    # LLM helper (Groq + Gemini + Mocks)
│   ├── agents/                   # 11 specialized AI agents
│   │   ├── base_agent.py         # Abstract base class
│   │   ├── planner_agent.py
│   │   ├── discovery_agent.py
│   │   ├── validation_agent.py
│   │   ├── company_profile_agent.py
│   │   ├── founder_profile_agent.py
│   │   ├── github_agent.py
│   │   ├── news_agent.py
│   │   ├── market_analysis_agent.py
│   │   ├── scoring_agent.py
│   │   ├── report_agent.py
│   │   └── contact_agent.py
│   ├── memory/
│   │   └── store.py              # In-memory data store
│   └── workflow/
│       └── runner.py             # Sequential agent orchestrator
├── frontend/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx               # Root component
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   └── CompanyDetail.tsx # Company detail view
│   │   ├── components/           # Reusable UI components
│   │   ├── api/client.ts         # API client (axios)
│   │   └── types/index.ts        # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── tests/                        # pytest test suite
│   ├── __init__.py
│   └── test_stubs.py
├── docs/                         # Documentation
├── .env.example                  # Environment variable template
├── requirements.txt              # Python dependencies
├── pyproject.toml                # Project metadata & tool config
└── README.md
```

---

## Troubleshooting Quick Reference

| Issue | Fix |
|-------|-----|
| Port 8000 in use | Kill existing process or use `--port 8001` |
| `GEMINI_API_KEY not set` | Check `.env` file exists and key is filled |
| `groq package not installed` | Run `pip install groq` |
| Frontend can't reach backend | Check CORS settings and `VITE_API_BASE_URL` |
| `429 RESOURCE_EXHAUSTED` | Gemini daily limit hit — configure `GROQ_API_KEY` |

See [Troubleshooting Guide](troubleshooting.md) for detailed solutions.
