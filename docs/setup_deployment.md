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
cd backend
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
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify it's running:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"VenturePilot AI","version":"1.0.0"}
```

Auto-generated API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## 3. Frontend Setup

```bash
cd ../frontend
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
# From the backend directory
cd ../backend
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

## 6. Cloud Deployment (Production)

VenturePilot AI is deployed as a **split-tier architecture** on free cloud platforms:

### Frontend → Vercel

1. **Connect repository** at [vercel.com/new](https://vercel.com/new)
2. **Set Root Directory** to `frontend`
3. **Framework Preset**: Vite (auto-detected)
4. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL = https://<your-render-service>.onrender.com
   ```
5. **Deploy** — Vercel builds and serves the static SPA
6. **Custom Domain** (optional): Configure in Vercel → Settings → Domains

**Live URL**: [xl-ventures-ai.vercel.app](https://xl-ventures-ai.vercel.app/)

### Backend → Render

1. **Create a New Web Service** at [dashboard.render.com](https://dashboard.render.com)
2. **Connect your GitHub repo**
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `backend` |
   | **Runtime** | Python 3 |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
4. **Add Environment Variables** in the Render dashboard:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `GITHUB_TOKEN`
   - `NEWSAPI_KEY`
   - `GOOGLE_CSE_API_KEY`
   - `GOOGLE_CSE_ID`
5. **Deploy** — Render builds the Python environment and starts Uvicorn

> ⚠️ **Free tier note**: Render free web services spin down after ~15 minutes of inactivity. First request after sleep takes ~30 seconds.

### Keep-Alive → cron-job.org

To prevent Render cold starts, set up a scheduled health ping:

1. **Sign up** at [cron-job.org](https://cron-job.org)
2. **Create a new cron job**:
   | Field | Value |
   |-------|-------|
   | **URL** | `https://<your-render-service>.onrender.com/health` |
   | **Schedule** | Every 14 minutes |
   | **HTTP Method** | GET |
   | **Expected Response** | HTTP 200 |
3. **Enable** the job — Render will stay warm continuously

### Deployment Topology

```
┌────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌─────────────────────┐      HTTPS     ┌──────────────────┐ │
│   │  ▲ Vercel            │ ◄────────────► │  🟢 Render        │ │
│   │  React SPA (Static)  │               │  FastAPI + Agents │ │
│   │  CDN Edge Network    │               │  Python 3.11      │ │
│   │                      │               │  Free Web Service │ │
│   │  xl-ventures-ai      │               │                   │ │
│   │  .vercel.app         │               │  /analyze         │ │
│   └─────────────────────┘               │  /results/{id}    │ │
│                                          │  /companies       │ │
│   ┌─────────────────────┐  GET /health   │  /health          │ │
│   │  ⏰ cron-job.org     │ ──────────────►│                   │ │
│   │  Every 14 minutes    │               └──────────────────┘ │
│   └─────────────────────┘                        │            │
│                                                  ▼            │
│                                      ┌──────────────────────┐ │
│                                      │  External APIs        │ │
│                                      │  • Groq (LLM)         │ │
│                                      │  • Gemini (fallback)  │ │
│                                      │  • GitHub API          │ │
│                                      │  • NewsAPI             │ │
│                                      │  • Google CSE          │ │
│                                      └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

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
├── backend/                      # Python backend directory
│   ├── app/                      # Python application package (formerly src)
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI application
│   │   ├── llm.py                # LLM helper (Groq + Gemini + Mocks)
│   │   ├── agents/               # 11 specialized AI agents
│   │   │   ├── base_agent.py     # Abstract base class
│   │   │   ├── planner_agent.py
│   │   │   ├── discovery_agent.py
│   │   │   ├── validation_agent.py
│   │   │   ├── company_profile_agent.py
│   │   │   ├── founder_profile_agent.py
│   │   │   ├── github_agent.py
│   │   │   ├── news_agent.py
│   │   │   ├── market_analysis_agent.py
│   │   │   ├── scoring_agent.py
│   │   │   ├── report_agent.py
│   │   │   └── contact_agent.py
│   │   ├── memory/
│   │   │   └── store.py          # In-memory data store
│   │   └── workflow/
│   │       └── runner.py         # Sequential agent orchestrator
│   ├── tests/                    # pytest test suite
│   │   ├── __init__.py
│   │   └── test_stubs.py
│   ├── .env.example              # Environment variable template
│   ├── pyproject.toml            # Project metadata & tool config
│   ├── pyrightconfig.json        # Pyright typing configurations
│   └── requirements.txt          # Python dependencies
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
├── docs/                         # System Documentation
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
