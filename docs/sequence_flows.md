---
title: "Sequence & Flow Diagrams"
description: "Agent orchestration flows and user interaction sequences"
---

# VenturePilot AI — Sequence & Flow Diagrams

## 1. Main Workflow Sequence

The complete flow from user ICP submission to scored results display:

```mermaid
sequenceDiagram
    actor User
    participant UI as React Dashboard
    participant API as FastAPI
    participant Runner as Workflow Runner
    participant Store as In-Memory Store
    participant LLM as Groq / Gemini

    User->>UI: Fill ICP form & submit
    UI->>API: POST /analyze {industry, stage, location, keywords}
    API->>Store: clear_all()
    API->>Store: create_job(icp)
    API->>Runner: start_workflow_async(job_id, icp)
    API-->>UI: {job_id, status: "running"}

    loop Poll every 2s
        UI->>API: GET /results/{job_id}
        API->>Store: get_job(job_id)
        API-->>UI: {status, current_step}
    end

    Runner->>Runner: DiscoveryAgent.run(icp)
    Runner->>Runner: ValidationAgent.run(companies)

    loop For each company
        Runner->>LLM: CompanyProfileAgent
        Runner->>LLM: FounderProfileAgent
        Runner->>Runner: GitHubAgent (GitHub API)
        Runner->>LLM: NewsAgent
        Runner->>LLM: MarketAnalysisAgent
        Runner->>LLM: ScoringAgent
        Runner->>LLM: ReportAgent
        Runner->>Store: save_company(enriched)
    end

    Runner->>Store: update_job(status="done")
    UI->>API: GET /companies
    API->>Store: get_all_companies()
    API-->>UI: Scored company list
    User->>UI: Click company row
    UI->>UI: Show CompanyDetail page
```

## 2. LLM Failover Flow

How every LLM call routes through the 3-tier provider chain:

```mermaid
flowchart TD
    A[Agent calls ask/ask_json] --> B{GROQ_API_KEY set?}
    B -->|Yes| C[Call Groq API]
    B -->|No| F

    C --> D{Response OK?}
    D -->|Yes| E[Return Groq response]
    D -->|No / Error| F[Call Gemini API]

    F --> G{GEMINI_API_KEY set?}
    G -->|No| J
    G -->|Yes| H{Response OK?}
    H -->|Yes| I[Return Gemini response]
    H -->|No / Error| J[Smart Mock Fallback]

    J --> K[Return mock response based on prompt keywords]

    style E fill:#22c55e,color:#fff
    style I fill:#3b82f6,color:#fff
    style K fill:#f59e0b,color:#fff
```

## 3. Discovery Agent Strategy

The three-tier company discovery fallback:

```mermaid
flowchart TD
    Start[DiscoveryAgent.run] --> CSE{Google CSE keys available?}
    CSE -->|Yes| Search[Search Google CSE]
    CSE -->|No| LLM

    Search --> Results{Results > 0?}
    Results -->|Yes| Done[Return companies]
    Results -->|No| LLM

    LLM[LLM Discovery] --> LLMResult{LLM returned companies?}
    LLMResult -->|Yes| Done
    LLMResult -->|No| Mock

    Mock[Static Mock Fallback] --> Match{Industry match in MOCK_COMPANIES?}
    Match -->|Yes| Done
    Match -->|No| Dynamic[Dynamic Mock Generator]
    Dynamic --> Done

    style Done fill:#22c55e,color:#fff
    style Dynamic fill:#f59e0b,color:#fff
```

## 4. HITL Approval Flow

Human-in-the-Loop decision workflow:

```mermaid
sequenceDiagram
    actor Analyst
    participant Detail as CompanyDetail Page
    participant HITL as HITL Panel
    participant API as FastAPI
    participant Store as In-Memory Store

    Analyst->>Detail: Click company from pipeline
    Detail->>Detail: Display full profile, scores, report
    Analyst->>HITL: Select decision (Approve / Reject / More Info)
    Analyst->>HITL: Add notes (optional)
    HITL->>API: POST /approve/{company_id} {decision, notes}
    API->>Store: save_decision(company_id, decision, notes)
    API-->>HITL: {status: "recorded"}
    HITL-->>Analyst: Show confirmation badge
```

## 5. Scoring Rubric Flow

How the ScoringAgent computes the 0–100 investment score:

```mermaid
flowchart LR
    subgraph Inputs
        F[Founders list]
        G[GitHub metrics]
        N[News sentiment]
        M[Market stage]
        S[Funding stage]
    end

    subgraph Scoring["Score Computation"]
        T[Team Score<br/>Weight: 30%]
        TH[Tech Score<br/>Weight: 25%]
        TR[Traction Score<br/>Weight: 25%]
        MK[Market Score<br/>Weight: 20%]
    end

    F --> T
    G --> TH
    N --> TR
    S --> TR
    M --> MK

    T & TH & TR & MK --> WS[Weighted Sum]
    WS --> Tier{Score >= 75?}
    Tier -->|Yes| High[🟢 High Priority]
    Tier -->|No| Med{Score >= 50?}
    Med -->|Yes| Medium[🟡 Medium Priority]
    Med -->|No| Low[🔴 Low Priority]
```
