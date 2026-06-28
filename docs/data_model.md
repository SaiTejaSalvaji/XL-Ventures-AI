---
title: "Data Model"
description: "Entity-relationship diagram and data structures for VenturePilot AI"
---

# VenturePilot AI — Data Model

## Overview

VenturePilot AI uses an **in-memory dict-based store** (`src/memory/store.py`) with four top-level collections. All data is ephemeral and resets when the server restarts.

## Entity-Relationship Diagram

```mermaid
erDiagram
    JOB ||--o{ COMPANY : produces
    COMPANY ||--o{ FOUNDER : has
    COMPANY ||--|| GITHUB_DATA : has
    COMPANY ||--|| NEWS_DATA : has
    COMPANY ||--|| MARKET_DATA : has
    COMPANY ||--|| SCORE_BREAKDOWN : has
    COMPANY ||--o| DECISION : receives
    NEWS_DATA ||--o{ NEWS_ARTICLE : contains
    MARKET_DATA ||--o{ COMPETITOR : contains

    JOB {
        string job_id PK
        string status "queued | running | done | error"
        dict icp
        list result "company names"
        string current_step
        string created_at
    }

    COMPANY {
        string id PK
        string name UK
        string url
        string industry
        string stage
        string location
        string description
        string tagline
        string product
        string target_customers
        list tech_stack
        string employee_estimate
        string business_model
        boolean validated
        int score "0-100"
        string tier "High | Medium | Low"
        string rationale
        string report "Markdown"
        string created_at
    }

    FOUNDER {
        string name
        string title
        string background
        string education
        string linkedin_url
        list past_companies
    }

    GITHUB_DATA {
        int repo_count
        int total_stars
        int total_forks
        string last_commit_date
        list primary_languages
        string github_org_url
        string source
    }

    NEWS_DATA {
        string sentiment "positive | neutral | negative"
        list momentum_signals
        string summary
    }

    NEWS_ARTICLE {
        string title
        string url
        string published_at
        string source
    }

    MARKET_DATA {
        string tam_estimate
        string market_growth_rate
        list key_trends
        string market_stage
    }

    COMPETITOR {
        string name
        string url
        string differentiator
    }

    SCORE_BREAKDOWN {
        int team "0-100"
        int technology "0-100"
        int traction "0-100"
        int market "0-100"
    }

    DECISION {
        string company_id FK
        string decision "approve | reject | more_info"
        string notes
        string recorded_at
    }
```

## In-Memory Store Schema

The global store in `src/memory/store.py` is a Python dict:

```python
_store: dict = {
    "companies": {},   # name → Company dict
    "reports": {},     # name → Markdown string
    "decisions": {},   # company_id → Decision dict
    "jobs": {},        # job_id → Job dict
}
```

## ICP (Ideal Customer Profile) Schema

The input provided by the user to trigger the pipeline:

```python
class ICPRequest(BaseModel):
    industry: str = "AI Healthcare"
    stage: str = "Seed"
    location: str = "India"
    tech_keywords: list[str] = ["machine learning", "AI"]
```

## TypeScript Interfaces (Frontend)

The frontend mirrors the backend data model via TypeScript interfaces in `frontend/src/types/index.ts`:

| Interface | Key Fields |
|-----------|------------|
| `ICP` | industry, stage, location, tech_keywords |
| `Company` | id, name, url, score, tier, founders, github, news, market, report |
| `Founder` | name, title, background, education, linkedin_url, past_companies |
| `GitHubData` | repo_count, total_stars, total_forks, primary_languages |
| `NewsData` | articles, sentiment, momentum_signals, summary |
| `MarketData` | competitors, tam_estimate, market_growth_rate, key_trends |
| `ScoreBreakdown` | team, technology, traction, market |
| `JobStatus` | job_id, status, current_step, companies |
| `Decision` | `"approve" \| "reject" \| "more_info"` |

## Data Lifecycle

1. **Creation** — `POST /analyze` clears all data and creates a new Job.
2. **Population** — The workflow runner progressively saves companies as they complete enrichment.
3. **Querying** — Frontend polls `/results/{job_id}` and then fetches `/companies`.
4. **HITL** — Analyst decisions are saved via `POST /approve/{company_id}`.
5. **Reset** — Data is wiped on every new analysis run or server restart.
