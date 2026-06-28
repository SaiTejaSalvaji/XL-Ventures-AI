# VenturePilot AI (AgentOS) — Implementation Plan
> **Prototype Edition** — Gemini-powered, free APIs only, interview-ready demo.

---

## Tech Stack (Simplified)

| Layer | Technology | Cost |
|-------|-----------|------|
| LLM | **Google Gemini 1.5 Flash** | ✅ Free |
| Backend | FastAPI + Uvicorn | ✅ Free |
| Frontend | React + TypeScript (Vite) | ✅ Free |
| Memory | **In-memory Python dict** | ✅ Free (no DB setup) |
| Orchestration | **Simple sequential runner** | ✅ Free (no LangGraph) |
| Company data | Google CSE + mock fallback | ✅ Free (100/day) |
| GitHub data | GitHub REST API | ✅ Free |
| News | NewsAPI.org | ✅ Free (100/day) |
| Email lookup | Mock / placeholder | ✅ Free |

> **Dropped**: OpenAI, Anthropic, Qdrant, PostgreSQL, LangGraph, Neo4j, networkx, Hunter.io

---

## What the Evaluator Will See

A live demo where:
1. Analyst enters an ICP (e.g. "AI Healthcare, Seed stage, India")
2. System runs 5+ agents in sequence (visible progress in UI)
3. Dashboard shows discovered companies with scores
4. Click any company → full Gemini-written due-diligence report
5. Approve / Reject buttons (HITL)

**This is enough to demonstrate agentic AI architecture to interviewers.**

---

## Stage 1 — Research & Setup ✅ DONE

Files created: README, requirements.txt, pyproject.toml, .env.example, .gitignore,
all agent stubs (11 files), docs/, tests/test_stubs.py, src/llm.py

---

## Stage 2 — Core Infrastructure (CURRENT)

### Files to Create/Update

| File | Purpose |
|------|---------|
| `src/llm.py` | ✅ Done — Gemini helper (`ask`, `ask_json`) |
| `src/memory/store.py` | Simple in-memory dict store for companies |
| `src/workflow/runner.py` | Sequential agent runner (Discovery→Score→Report) |
| `src/agents/base_agent.py` | Already done |
| `.env.example` | ✅ Updated — Gemini only |
| `requirements.txt` | ✅ Updated — no paid deps |

### Memory: In-Memory Store (no DB)
```python
# src/memory/store.py
_store: dict = {"companies": {}, "reports": {}}

def save_company(c: dict) -> None: _store["companies"][c["name"]] = c
def get_companies() -> list[dict]: return list(_store["companies"].values())
def save_report(name: str, report: str) -> None: _store["reports"][name] = report
```

### Workflow: Sequential Runner
```python
# src/workflow/runner.py
class WorkflowRunner:
    def run(self, icp: dict) -> list[dict]:
        companies = DiscoveryAgent().run(icp=icp)
        companies = ValidationAgent().run(companies=companies)
        for c in companies:
            c.update(CompanyProfileAgent().run(company=c))
            c["github"] = GitHubAgent().run(company=c)
            c["news"]   = NewsAgent().run(company=c)
            c["score"]  = ScoringAgent().run(profile=c)
            c["report"] = ReportAgent().run(profile=c)
            store.save_company(c)
        return store.get_companies()
```

---

## Stage 3 — Working Agents

### Agent Implementation Priority

| Agent | Implementation | API Used |
|-------|---------------|---------|
| PlannerAgent | Gemini generates plan | Gemini |
| DiscoveryAgent | Google CSE → mock fallback | Google CSE (free) |
| ValidationAgent | HTTP HEAD check | stdlib requests |
| CompanyProfileAgent | Scrape + Gemini summarize | Gemini |
| GitHubAgent | PyGithub | GitHub API (free) |
| NewsAgent | NewsAPI.org | NewsAPI (free) |
| ScoringAgent | Rubric + Gemini rationale | Gemini |
| ReportAgent | Gemini full report | Gemini |
| FounderProfileAgent | Google search + Gemini | Gemini |
| MarketAnalysisAgent | Gemini market knowledge | Gemini |
| ContactAgent | Mock placeholder | None |

### Mock Fallback for Demo
All agents fall back to **curated mock data** when APIs are unavailable.
This ensures the demo always works even without all API keys configured.

```python
# discovery_agent.py fallback
MOCK_COMPANIES = [
    {"name": "Niramai Health", "url": "https://niramai.com",
     "industry": "AI Healthcare", "location": "India"},
    {"name": "Tricog Health", "url": "https://tricog.com",
     "industry": "AI Healthcare", "location": "India"},
    ...
]
```

---

## Stage 4 — FastAPI Backend + React Frontend

### Backend Endpoints

| Method | Path | Returns |
|--------|------|---------|
| GET | `/health` | `{status: "ok"}` |
| POST | `/analyze` | `{job_id, status}` |
| GET | `/results/{job_id}` | `{companies: [...]}` |
| POST | `/approve/{company_id}` | `{status: "recorded"}` |
| GET | `/companies` | `[...all companies]` |

### Frontend Pages (React + TypeScript)

| Page/Component | Purpose |
|---------------|---------|
| `Dashboard.tsx` | ICP form + live agent progress + results table |
| `CompanyDetail.tsx` | Full report view with score, founders, news |
| `ICPForm.tsx` | Industry, stage, location, keywords inputs |
| `AgentProgress.tsx` | Step-by-step live execution display |
| `ScoreBadge.tsx` | Color-coded High/Medium/Low badge |
| `HITLPanel.tsx` | Approve / Reject / More Info |

---

## Stage 5 — Polish & Demo Prep

- Add `demo/sample_icp.json` for the demo run
- Ensure all agents have mock fallbacks
- Connect frontend polling (`/results/{job_id}`) to show live progress
- Style the UI to look premium (dark mode, gradient accents)
- Record a 5-minute walkthrough

---

## Verification Checklist

- [ ] `pytest tests/test_stubs.py -v` — all pass
- [ ] `uvicorn src.main:app --reload` — server starts
- [ ] `POST /analyze` with sample ICP returns companies with scores
- [ ] `GET /results/{job_id}` returns populated company list
- [ ] Frontend loads, form submits, results appear
- [ ] One company click shows full Gemini-written report
- [ ] Approve button records decision

---

## Free API Keys — Where to Get Them

| Key | URL | Free Limit |
|-----|-----|-----------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | 15 RPM, 1M tokens/day |
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) | 5000 req/hr |
| `NEWSAPI_KEY` | [newsapi.org/register](https://newsapi.org/register) | 100 req/day |
| `GOOGLE_CSE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) | 100 req/day |
