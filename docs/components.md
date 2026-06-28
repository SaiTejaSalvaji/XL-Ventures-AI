---
title: "Components & Modules"
description: "Detailed descriptions of every module in VenturePilot AI"
---

# VenturePilot AI — Components & Modules

## Overview

VenturePilot AI is organized into four major layers: **Agents**, **Core Services**, **Workflow Orchestration**, and **Frontend UI**. Each agent inherits from `BaseAgent` and implements a `run()` method.

---

## Agent Pipeline

All agents inherit from [`BaseAgent`](../src/agents/base_agent.py) which enforces:
- A unique `name` string identifier
- A `description` for logging and UI display
- A `run(**kwargs)` method as the execution entry point
- Built-in structured logging via `log_start()`, `log_done()`, `log_error()`

### 1. PlannerAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/planner_agent.py` |
| **Name** | `planner` |
| **Input** | `icp: dict` |
| **Output** | `list[str]` — ordered agent names |
| **LLM** | Yes |

Generates a dynamic execution plan based on the ICP. Falls back to a hardcoded default plan if the LLM is unavailable.

### 2. DiscoveryAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/discovery_agent.py` |
| **Name** | `discovery` |
| **Input** | `icp: dict` |
| **Output** | `list[dict]` — discovered companies |
| **LLM** | Yes (fallback) |
| **External APIs** | Google Custom Search Engine |

Three-tier discovery strategy:
1. **Google CSE** — real web search for matching startups
2. **LLM Discovery** — asks the LLM to generate plausible companies
3. **Static Mock Fallback** — curated list of companies per industry + dynamic generator

### 3. ValidationAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/validation_agent.py` |
| **Name** | `validation` |
| **Input** | `companies: list[dict]` |
| **Output** | `list[dict]` — validated companies |
| **LLM** | No |

Performs HTTP HEAD requests to check if company URLs are reachable. Filters out dead links. Always keeps at least 3 companies for the demo.

### 4. CompanyProfileAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/company_profile_agent.py` |
| **Name** | `company_profile` |
| **Input** | `company: dict` |
| **Output** | `dict` — enriched company profile |
| **LLM** | Yes |

Scrapes the company homepage with BeautifulSoup, then uses the LLM to extract structured fields: tagline, product, target customers, tech stack, employee estimate, founded year, and business model.

### 5. FounderProfileAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/founder_profile_agent.py` |
| **Name** | `founder_profile` |
| **Input** | `company: dict` |
| **Output** | `list[dict]` — founder profiles |
| **LLM** | Yes |

Uses the LLM to generate 1–3 realistic founder profiles with name, title, background, education, LinkedIn URL, and past companies.

### 6. GitHubAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/github_agent.py` |
| **Name** | `github` |
| **Input** | `company: dict` |
| **Output** | `dict` — GitHub metrics |
| **LLM** | No |
| **External APIs** | GitHub REST API (via PyGithub) |

Fetches real GitHub organization stats: repo count, total stars, forks, last commit date, and primary languages. Falls back to randomized mock data.

### 7. NewsAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/news_agent.py` |
| **Name** | `news` |
| **Input** | `company: dict` |
| **Output** | `dict` — news data with sentiment |
| **LLM** | Yes |
| **External APIs** | NewsAPI.org |

Fetches recent news articles via NewsAPI, then uses the LLM for sentiment classification. Falls back to LLM-generated mock news if NewsAPI key is unavailable.

### 8. MarketAnalysisAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/market_analysis_agent.py` |
| **Name** | `market_analysis` |
| **Input** | `company: dict` |
| **Output** | `dict` — market landscape |
| **LLM** | Yes |

Uses the LLM to generate competitive landscape data: competitors, TAM estimate, market growth rate, key trends, and market stage.

### 9. ScoringAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/scoring_agent.py` |
| **Name** | `scoring` |
| **Input** | `profile: dict` |
| **Output** | `dict` — score, tier, breakdown, rationale |
| **LLM** | Yes (rationale only) |

Computes a weighted investment score (0–100) using a rule-based rubric across four dimensions:
- **Team** (30%) — founder count, pedigree signals
- **Technology** (25%) — GitHub stars, repo count
- **Traction** (25%) — news sentiment, funding stage
- **Market** (20%) — market stage classification

Tiers: High (≥75), Medium (≥50), Low (<50). Uses the LLM to generate a 2–3 sentence rationale.

### 10. ReportAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/report_agent.py` |
| **Name** | `report` |
| **Input** | `profile: dict` |
| **Output** | `str` — Markdown report |
| **LLM** | Yes |

Generates a full Markdown due-diligence report with sections: Executive Summary, Company Overview, Team & Leadership, Technology & Product, Market Opportunity, Competitive Landscape, Recent Traction & News, Risk Factors, and Investment Recommendation.

### 11. ContactAgent
| Property | Value |
|----------|-------|
| **File** | `src/agents/contact_agent.py` |
| **Name** | `contact` |
| **Input** | `founder: dict, domain: str` |
| **Output** | `dict` — contact info |
| **LLM** | No |

Generates plausible professional email addresses from founder names and company domains. Not wired into the main pipeline yet.

---

## Core Services

### LLM Helper (`src/llm.py`)
The unified LLM gateway. Routes all agent LLM calls through a 3-tier failover chain:
1. **Groq** (Llama-3.3-70b-versatile) — primary, fast, 14,400 RPD
2. **Gemini** (gemini-2.0-flash) — fallback
3. **Smart Mocks** — deterministic fallback generators for every agent type

Exposes two functions:
- `ask(prompt, fallback)` → `str`
- `ask_json(prompt, fallback)` → `dict`

### In-Memory Store (`src/memory/store.py`)
Dict-based storage for the prototype. Stores:
- **Companies** — keyed by name
- **Reports** — keyed by company name
- **Decisions** — HITL approval/rejection records
- **Jobs** — workflow status tracking (queued → running → done/error)

### Workflow Runner (`src/workflow/runner.py`)
Sequential orchestrator that chains all agents. Runs in a background `threading.Thread`. Updates job status at each step so the frontend can poll progress.

---

## Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| **App** | `frontend/src/App.tsx` | Root component, navbar, routing, health check |
| **Dashboard** | `frontend/src/pages/Dashboard.tsx` | ICP form, agent progress, company pipeline table |
| **CompanyDetail** | `frontend/src/pages/CompanyDetail.tsx` | Full company profile, founders, scores, report |
| **ICPForm** | `frontend/src/components/ICPForm.tsx` | ICP input form (industry, stage, location, keywords) |
| **AgentProgress** | `frontend/src/components/AgentProgress.tsx` | Real-time agent execution status display |
| **CompanyTable** | `frontend/src/components/CompanyTable.tsx` | Sortable company results table |
| **HITLPanel** | `frontend/src/components/HITLPanel.tsx` | Human-in-the-Loop approval/rejection panel |
| **ScoreBadge** | `frontend/src/components/ScoreBadge.tsx` | Color-coded score tier badge |
| **API Client** | `frontend/src/api/client.ts` | Axios-based API client for all backend calls |
| **Types** | `frontend/src/types/index.ts` | TypeScript interfaces (Company, ICP, JobStatus, etc.) |
