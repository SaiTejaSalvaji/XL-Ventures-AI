# VenturePilot AI — Codebase Notes

Developer reference for the simplified prototype.  
**Stack**: Gemini + FastAPI + React+TypeScript + In-memory store.  
**Last Updated**: Stage 2 (all agents functional)

---

## Quick File Map

| File | What it does |
|------|-------------|
| `src/llm.py` | Gemini helper — `ask(prompt)` and `ask_json(prompt)` |
| `src/main.py` | FastAPI app — 6 endpoints, CORS, Pydantic models |
| `src/memory/store.py` | In-memory dict store — companies, reports, jobs, decisions |
| `src/workflow/runner.py` | Sequential agent runner in a background thread |
| `src/agents/base_agent.py` | Abstract base class — all agents inherit this |
| `src/agents/planner_agent.py` | Gemini generates agent execution plan |
| `src/agents/discovery_agent.py` | Google CSE search + mock Indian AI startup data |
| `src/agents/validation_agent.py` | HTTP HEAD check for domain reachability |
| `src/agents/company_profile_agent.py` | Scrape homepage + Gemini JSON extraction |
| `src/agents/founder_profile_agent.py` | Gemini generates founder profiles |
| `src/agents/github_agent.py` | PyGithub stats + random mock fallback |
| `src/agents/market_analysis_agent.py` | Gemini competitive landscape + TAM |
| `src/agents/news_agent.py` | NewsAPI.org + Gemini sentiment / mock news |
| `src/agents/contact_agent.py` | Derives email from founder name + domain |
| `src/agents/scoring_agent.py` | Rubric math + Gemini rationale text |
| `src/agents/report_agent.py` | Gemini full 9-section Markdown report |

---

## src/llm.py — Gemini Helper

The single shared LLM interface. All agents import from here.

```python
from src.llm import ask, ask_json

# Plain text response
text = ask("Summarize this company in 2 sentences.")

# Structured JSON response (auto-strips code fences)
data = ask_json("Return JSON with keys name, score.")
```

**Key behaviours**:
- **Lazy init**: model only created on first call (avoids startup delay)
- **Graceful fallback**: if `GEMINI_API_KEY` is missing, returns the `fallback` value — no crash
- **JSON stripping**: automatically removes ` ```json ``` ` fences from Gemini output
- **Model**: `gemini-1.5-flash` — fastest free-tier model, good quality

---

## src/memory/store.py — In-Memory Store

All data lives in a single module-level dict `_store`. No DB setup required.

```python
from src.memory import store

store.save_company({"name": "Acme", "score": 82, ...})
companies = store.get_all_companies()
job_id = store.create_job(icp_dict)
store.update_job(job_id, status="done", result=[...])
store.save_decision("company-uuid", "approve", "Strong team")
```

**Limitation**: Data resets when the server restarts. Fine for prototype demos.

---

## src/workflow/runner.py — Sequential Runner

Runs all agents in sequence in a **background thread** (non-blocking POST /analyze).

```
Thread: run_workflow(job_id, icp)
  → DiscoveryAgent.run(icp)
  → ValidationAgent.run(companies)
  → for each company:
      CompanyProfileAgent → FounderProfileAgent → GitHubAgent
      → NewsAgent → MarketAnalysisAgent → ScoringAgent → ReportAgent
      → store.save_company(company)
  → store.update_job(job_id, status="done")
```

The frontend polls `GET /results/{job_id}` every 2 seconds to show live progress.

---

## src/agents/ — Agent Notes

### Every agent follows this pattern:
```python
class XxxAgent(BaseAgent):
    name = "xxx"
    description = "What it does"

    def run(self, **kwargs) -> result_type:
        self.log_start({...})    # structured log
        result = ...             # real logic or mock fallback
        self.log_done("summary")
        return result
```

### Fallback Strategy
Every agent has a **two-layer fallback**:
1. Try real API (Google CSE, NewsAPI, GitHub, etc.)
2. If key missing or error → use Gemini knowledge or curated mock data

This guarantees the demo works even with zero API keys (just `GEMINI_API_KEY`).

### Agent-by-Agent Notes

**DiscoveryAgent**
- Builds search query from ICP: `"AI healthcare startup India Seed 2024"`
- Google CSE returns 10 results parsed into company dicts
- If no CSE key → returns 7 curated Indian AI healthcare startups (hard-coded)

**ValidationAgent**
- `requests.head(url, timeout=5)` — any status < 500 = valid
- Always keeps minimum 3 companies for demo safety

**CompanyProfileAgent**
- Fetches URL, extracts `<meta name="description">` + first 800 chars body
- Sends to Gemini: returns `{tagline, product, target_customers, tech_stack, employee_estimate}`
- Fallback: returns description field from discovery

**FounderProfileAgent**
- No LinkedIn API — uses Gemini's training data knowledge about companies
- For well-known companies (Qure.ai, Niramai) Gemini knows actual founders
- For unknown → generates plausible IIT-educated Indian founder profile

**GitHubAgent**
- Tries `g.get_organization(company_name_slug)` via PyGithub
- Falls back to random-realistic mock (50–2000 stars, 2–15 repos)

**NewsAgent**
- NewsAPI `GET /v2/everything?q={name}&sortBy=publishedAt`
- Gemini classifies sentiment from headlines
- If no API key → Gemini generates mock news articles for demo

**MarketAnalysisAgent**
- 100% Gemini — asks for competitors, TAM, CAGR, trends for given industry
- No external API needed — Gemini has this market knowledge built-in

**ScoringAgent**
- Rule-based math first (team founders, GitHub stars, funding stage, sentiment)
- Gemini writes a 2-3 sentence rationale from the scores
- Score: `team×0.30 + tech×0.25 + traction×0.25 + market×0.20`

**ReportAgent**
- Packs all profile data into a rich Gemini prompt
- Gets back a 9-section Markdown report (Executive Summary → Recommendation)
- Stored as `company["report"]` for the frontend to render

---

## FastAPI Endpoints

```bash
# Start server
uvicorn src.main:app --reload

# Test health
curl http://localhost:8000/health

# Start analysis
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"industry":"AI Healthcare","stage":"Seed","location":"India"}'
# → {"job_id": "uuid", "status": "running"}

# Poll results
curl http://localhost:8000/results/{job_id}

# Get all companies
curl http://localhost:8000/companies

# Approve a company
curl -X POST http://localhost:8000/approve/{company_id} \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve","notes":"Strong team"}'
```

Browse **http://localhost:8000/docs** for interactive Swagger UI.

---

## React Frontend (Stage 4)

**Tech**: React 18 + TypeScript + Vite

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

**Key types** (`frontend/src/types/index.ts`):
```typescript
interface Company {
  id: string; name: string; url: string;
  industry: string; stage: string; location: string;
  score: number; tier: 'High' | 'Medium' | 'Low';
  rationale: string; report: string;
  founders: Founder[]; github: GitHubData; news: NewsData;
}
interface ICP { industry: string; stage: string; location: string; tech_keywords: string[]; }
```

---

## Running Tests

```bash
pytest tests/test_stubs.py -v    # Stage 1: import + contract tests
pytest tests/ -v                  # All tests
pytest tests/ -v --cov=src        # With coverage report
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `GEMINI_API_KEY not set` warning | Add key to `.env` — demo still works without it using mock data |
| `ModuleNotFoundError: src` | Run from project root: `cd XL-Ventures-AI; python -c "from src.llm import ask"` |
| Pylance squiggles on `src.xxx` | `Ctrl+Shift+P` → "Python: Restart Language Server" |
| NewsAPI 426 error | Free tier only allows developer plan — create account at newsapi.org |
| GitHub 403 | Add `GITHUB_TOKEN` to `.env` for higher rate limits |

---

## What's NOT in this Prototype (intentionally dropped)

| Dropped | Why | Alternative used |
|---------|-----|-----------------|
| OpenAI / Anthropic | Paid | Google Gemini (free) |
| LangGraph | Complex setup | Python threading + sequential loop |
| Qdrant vector DB | Requires Docker | In-memory dict |
| PostgreSQL | Requires server | In-memory dict |
| networkx graph | Overkill for prototype | Not needed |
| Hunter.io | Paid API | Email derived from name + domain |
| Neo4j | Server required | Not needed |
