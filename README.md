# 🚀 VenturePilot AI

> Multi-agent AI platform for B2B opportunity discovery — powered by **Google Gemini** (free).

A VC analyst types an ICP ("AI Healthcare, Seed, India") → the system runs 8 agents → returns scored companies with AI-written due-diligence reports.

---

## 🏗️ Architecture (Prototype)

```
User (ICP) → FastAPI → Sequential Runner
                           ├─ DiscoveryAgent    (Google CSE / mock)
                           ├─ ValidationAgent   (HTTP check)
                           ├─ CompanyProfile    (scrape + Gemini)
                           ├─ GitHubAgent       (GitHub API)
                           ├─ NewsAgent         (NewsAPI)
                           ├─ MarketAnalysis    (Gemini)
                           ├─ ScoringAgent      (rubric + Gemini)
                           └─ ReportAgent       (Gemini full report)
                                  ↓
                           In-Memory Store → React UI
```

---

## 🛠️ Tech Stack

| Layer | Tech | Cost |
|-------|------|------|
| LLM | Google Gemini 1.5 Flash | ✅ Free |
| Backend | FastAPI + Uvicorn | ✅ Free |
| Frontend | React + TypeScript (Vite) | ✅ Free |
| Storage | In-memory Python dict | ✅ Free |
| Company Data | Google CSE + mock fallback | ✅ Free |
| GitHub Stats | GitHub REST API | ✅ Free |
| News | NewsAPI.org | ✅ Free |

---

## ⚡ Quickstart

### 1. Clone & install
```bash
git clone <repo-url>
cd XL-Ventures-AI
pip install -r requirements.txt
```

### 2. Configure API keys
```bash
cp .env.example .env
# Fill in GEMINI_API_KEY (required) and optionally GITHUB_TOKEN, NEWSAPI_KEY
```

### 3. Run backend
```bash
uvicorn src.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (auto-generated API docs)
```

### 4. Run frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 5. Run tests
```bash
pytest tests/ -v
```

---

## 🔑 API Keys (all free)

| Key | Get it at | Free limit |
|-----|-----------|-----------|
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | 15 RPM, 1M tokens/day |
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) | 5000 req/hr |
| `NEWSAPI_KEY` | [newsapi.org/register](https://newsapi.org/register) | 100 req/day |
| `GOOGLE_CSE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) | 100 req/day |

> **Demo works without all keys** — agents fall back to curated mock data.

---

## 📁 Structure
```
src/
├── llm.py              # Gemini helper (ask, ask_json)
├── main.py             # FastAPI app
├── agents/             # 11 agent modules
├── memory/store.py     # In-memory company store
└── workflow/runner.py  # Sequential agent runner

frontend/src/
├── pages/Dashboard.tsx
├── pages/CompanyDetail.tsx
└── components/         # ICPForm, CompanyTable, ScoreBadge...

tests/                  # pytest suite
docs/                   # Architecture, codebase notes
```

---

## 📖 Docs
- [Architecture](docs/architecture.md)
- [Codebase Notes](docs/codebase_notes.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
