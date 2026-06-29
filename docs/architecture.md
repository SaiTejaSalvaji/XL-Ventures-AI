---
title: "Architecture Overview"
description: "High-level architecture of VenturePilot AI"
---

# VenturePilot AI — Architecture Overview

## Introduction

VenturePilot AI is a **multi-agent agentic AI platform** that automates B2B startup discovery and due-diligence for venture capital analysts. The system accepts an Ideal Customer Profile (ICP) from the user, orchestrates a pipeline of 11 specialized AI agents, and produces scored company profiles with full investment reports.

## System Architecture

The platform follows a **3-tier architecture**: a React frontend, a FastAPI backend, and an in-memory data store. All LLM calls are routed through a unified helper module (`llm.py`) that supports Groq (primary) and Gemini (fallback).

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Dashboard UI]
        ICPForm[ICP Form]
        CompanyTable[Company Table]
        DetailPage[Company Detail Page]
        HITL[HITL Approval Panel]
    end

    subgraph Backend["Backend (FastAPI + Uvicorn)"]
        API[FastAPI Router]
        Runner[Workflow Runner]
        Store[In-Memory Store]

        subgraph Agents["Agent Pipeline"]
            A1[PlannerAgent]
            A2[DiscoveryAgent]
            A3[ValidationAgent]
            A4[CompanyProfileAgent]
            A5[FounderProfileAgent]
            A6[GitHubAgent]
            A7[NewsAgent]
            A8[MarketAnalysisAgent]
            A9[ScoringAgent]
            A10[ReportAgent]
            A11[ContactAgent]
        end
    end

    subgraph LLM["LLM Providers"]
        Groq[Groq API — Llama 3.3 70B]
        Gemini[Google Gemini 2.0 Flash]
        Mocks[Smart Mock Fallback]
    end

    subgraph External["External APIs"]
        CSE[Google Custom Search]
        GH[GitHub REST API]
        News[NewsAPI.org]
    end

    UI --> API
    ICPForm --> API
    API --> Runner
    Runner --> Agents
    Runner --> Store
    Store --> API
    API --> UI

    A2 --> CSE
    A6 --> GH
    A7 --> News

    A1 & A2 & A4 & A5 & A7 & A8 & A9 & A10 --> Groq
    Groq -.->|fallback| Gemini
    Gemini -.->|fallback| Mocks
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Sequential agent pipeline** | Simplicity over parallelism for the prototype; agents depend on prior outputs |
| **In-memory store** | Zero database setup; data persists only during the server session |
| **Groq-first LLM routing** | 14,400 RPD free tier vs. Gemini's 20 RPD on GCP sandbox keys |
| **3-tier LLM failover** | Groq → Gemini → Smart Mocks ensures the demo always works |
| **Background threads** | `threading.Thread` for async workflow execution without asyncio complexity |
| **CORS allow-all** | Development convenience; should be restricted in production |

## Data Flow

1. **User** submits an ICP via the React form (industry, stage, location, tech keywords).
2. **FastAPI** receives the POST at `/analyze`, clears the store, creates a job, and launches the workflow in a background thread.
3. **Workflow Runner** chains agents sequentially: Discovery → Validation → Enrichment (Profile + GitHub + News + Market) → Scoring → Report.
4. Each enriched company is saved to the **In-Memory Store** as it completes.
5. **Frontend** polls `GET /results/{job_id}` every 2 seconds until status is `done`.
6. On completion, the frontend fetches `GET /companies` to display the scored pipeline.
7. **HITL Panel** allows the analyst to approve/reject companies via `POST /approve/{id}`.

## Deployment Topology

### Local Development

```
┌─────────────────┐     HTTP      ┌──────────────────────────┐
│  React (Vite)   │ ◄──────────► │  FastAPI (Uvicorn)       │
│  :5173          │               │  :8000                   │
│                 │               │  ├── /analyze            │
│  Dashboard.tsx  │               │  ├── /results/{id}       │
│  CompanyDetail  │               │  ├── /approve/{id}       │
└─────────────────┘               │  └── /health             │
                                  │                          │
                                  │  ┌─ Workflow Runner ───┐ │
                                  │  │  11 Agents Pipeline  │ │
                                  │  │  In-Memory Store    │ │
                                  │  └────────────────────┘ │
                                  └──────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │  External APIs           │
                              │  • Groq (LLM)            │
                              │  • Gemini (LLM fallback) │
                              │  • GitHub API             │
                              │  • NewsAPI                │
                              │  • Google CSE             │
                              └─────────────────────────┘
```

### Cloud Production Deployment

The production deployment uses a **split-tier architecture** across three managed platforms:

```mermaid
flowchart TB
    subgraph Internet["🌐 Internet"]
        User["👤 User / Browser"]
    end

    subgraph Vercel["▲ Vercel — Frontend"]
        FE["React + Vite Static SPA\nxl-ventures-ai.vercel.app\nCDN Edge Network"]
    end

    subgraph Render["🟢 Render — Backend"]
        BE["FastAPI + Uvicorn\n11 AI Agents\nIn-Memory Store"]
        Endpoints["/analyze\n/results/{id}\n/companies\n/health"]
    end

    subgraph CronJob["⏰ cron-job.org"]
        Cron["Scheduled GET /health\nEvery 14 minutes\nPrevents cold starts"]
    end

    subgraph LLMProviders["🤖 LLM Layer"]
        Groq["Groq — Llama 3.3 70B\n(Primary)"]
        Gemini["Google Gemini 2.0 Flash\n(Fallback)"]
        Mocks["Smart Mocks\n(Last Resort)"]
    end

    subgraph ExternalAPIs["🔌 External Data"]
        GitHub["GitHub REST API"]
        NewsAPI["NewsAPI.org"]
        CSE["Google Custom Search"]
    end

    User -->|HTTPS| FE
    FE -->|API Requests| BE
    Cron -->|GET /health| Endpoints
    BE --> Groq
    Groq -.->|failover| Gemini
    Gemini -.->|failover| Mocks
    BE --> GitHub & NewsAPI & CSE
```

| Layer | Platform | URL | Notes |
|-------|----------|-----|-------|
| **Frontend** | Vercel | [xl-ventures-ai.vercel.app](https://xl-ventures-ai.vercel.app/) | Static SPA, CDN-distributed |
| **Backend** | Render | Free Web Service | Auto-sleeps after 15 min inactivity |
| **Keep-Alive** | cron-job.org | `GET /health` every 14 min | Prevents Render cold starts |

## Security Considerations

- API keys are loaded from `.env` via `python-dotenv` and never committed (`.gitignore`).
- CORS is set to allow all origins (`*`) for development — must be restricted in production.
- No authentication layer is implemented in the prototype.
- The in-memory store is ephemeral; no persistent data is stored.
- Render environment variables are configured via the dashboard (never in source code).
