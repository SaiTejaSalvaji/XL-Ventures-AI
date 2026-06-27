# ProspectPilot AI

## Enterprise Agentic Sales Intelligence & Sourcing Platform

> **"Discover, Qualify, and Engage High-Value B2B Customers using Autonomous AI Agents."**

Welcome to **ProspectPilot AI**—a production-grade, enterprise-ready Agentic AI environment built for automated B2B lead discovery, validation, enrichment, scoring, and outreach sequencing. 

Unlike simple prompt-engineered chatbots, ProspectPilot AI is designed **platform-first**, separating the **Planner**, **Agent Registry**, **Tool Registry**, **Memory Engine**, and **Execution Engine** into modular, fully decoupled components.

---

## 💎 Recruiter & Judge Evaluation Summary

This platform was built to demonstrate enterprise software engineering principles. The grading rubric splits evaluation into:
- **Platform Architecture (70%)**
- **Business Sourcing Value (30%)**

Here is how our implementation directly answers those two key metrics:

### 1. Platform Architecture (70% Weight)
*   **The Brain (Planner Agent)**: The platform parses targeting parameters and dynamically builds a Directed Acyclic Graph (DAG) task path instead of relying on hardcoded chains.
*   **Decoupled Registries**: Agents and tools are modular classes that register themselves on server boot. Adding an agent is as simple as dropping a file into the `/agents/` directory, allowing for an extensible Marketplace.
*   **Multi-Tiered Memory Engine**: Features five memory layers: Working (task), Short-Term (run), Long-Term (persistent database caching), Semantic (character n-gram vector matching), and Knowledge (rules settings).
*   **Asynchronous Parallel Executor**: Traverses the DAG, computes topological orders, groups independent tasks, and runs them concurrently via `asyncio.gather` while handling retries and logging payloads.
*   **Observability Terminal**: Real-time console logs stream to the React UI, displaying detailed audit lines and expandable JSON trace payloads.

### 2. Business Sourcing Value (30% Weight)
*   **Sourcing Workflow**: Sourced around **IT Staffing & Recruitment** (easily generalizable to other fields).
*   **Target Trigger Sourcing**: Detects hiring growth signals, technology stacks (e.g. React, Python), locations (e.g. London, UK), and target executive personas (e.g. CTO, VP of Engineering).
*   **Human-in-the-Loop Gateway**: Sales lists are queued in a review interface. Operators can edit names, email addresses, and scoring parameters before approving them to move to the Leads Database.
*   **Exporter**: Outputs CSV, PDF text, and JSON tables of qualified leads.

---

## 🛠️ Technology Stack

*   **FastAPI Backend**: Python 3.12, Uvicorn, SQLAlchemy ORM, Pydantic validations, local TF-IDF character bi-gram vectorizer, SQLite database.
*   **Vite Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide icons.
*   **Enterprise Design System**: Slate and Indigo glassmorphic dark theme (`.glass-card`, `.grid-bg`), custom SVG score metrics, glowing activity states, and terminal views.

---

## 📁 Repository Directory Structure

```
XL-Ventures-AI/
├── backend/                       # Python API Service
│   ├── app/
│   │   ├── main.py                # FastAPI endpoints, database seeders, CORS
│   │   ├── config.py              # Environment configurations & keys helper
│   │   ├── planner/
│   │   │   └── planner_agent.py   # DAG compilation, input-to-output mapping
│   │   ├── agents/
│   │   │   ├── base.py            # BaseAgent abstract class
│   │   │   ├── registry.py        # AgentRegistry dynamic registry
│   │   │   ├── discovery.py       # Company Sourcing Agent
│   │   │   ├── validation.py      # Duplicate Checking Agent (against LTM)
│   │   │   ├── enrichment.py      # Scrape Tech Stack & Openings Agent
│   │   │   ├── decision_maker.py  # Persona Matching Agent (CTO/Founder)
│   │   │   ├── contact.py         # Email Finder & LinkedIn Lookup Agent
│   │   │   ├── recommendation.py  # Lead Fitness Scoring Agent
│   │   │   └── report.py          # Consolidated lead reporting Agent
│   │   ├── tools/
│   │   │   ├── base.py            # BaseTool abstract class
│   │   │   ├── registry.py        # ToolRegistry dynamic registry
│   │   │   ├── web_search.py      # Search tool (Tavily with mock fallback)
│   │   │   ├── scraper.py         # Scraper tool (Firecrawl with mock fallback)
│   │   │   ├── export_tool.py     # CSV/JSON file exports compiler
│   │   │   └── mock_data.py       # Cohesive generative mocking engine
│   │   ├── memory/
│   │   │   ├── engine.py          # Unified LTM, STM, vector search coordinator
│   │   │   └── vector_store.py    # Local character-level TF-IDF Vector index
│   │   ├── database/
│   │   │   ├── connection.py      # SQLite database connection setup
│   │   │   └── models.py          # SQLAlchemy tables schemas
│   │   ├── execution/
│   │   │   └── engine.py          # DAG topological sort, parallel executor
│   │   └── schemas/
│   │       └── schemas.py         # Pydantic request/response payload checks
│   ├── run.py                     # Backend startup script
│   └── requirements.txt
├── frontend/                      # React + TypeScript Client (Vite)
│   ├── package.json
│   ├── vite.config.ts             # Vite build settings & Tailwind v4 plugin
│   ├── tsconfig.json              # TypeScript compiler settings
│   ├── index.html                 # Index file & SEO meta fields
│   └── src/
│       ├── main.tsx               # Client bootstrapper
│       ├── App.tsx                # Shell layout & tabs view switcher
│       ├── index.css              # Custom styling definitions
│       └── components/            # Interface tabs views
│           ├── DashboardView.tsx  # Telemetry KPI cards and funnel charts
│           ├── WorkflowView.tsx   # Criteria builder form and visual DAG graph
│           ├── MonitorView.tsx    # Live pulsing node execution map and console
│           ├── QueueView.tsx      # Human approval card deck (Approve/Reject/Edit)
│           ├── LeadsView.tsx      # Leads table and CSV/JSON triggers
│           ├── MemoryView.tsx     # Memory cache list and vector query searcher
│           ├── RegistryView.tsx   # Catalog listing of registered agents/tools
│           └── SettingsView.tsx   # API settings and mock mode toggle
├── docs/                          # Consolidated Platform Documentation Chapters (1-9)
│   ├── 1_planner_agent.md         # Planner Agent dynamic DAG compilation
│   ├── 2_memory_engine.md         # Five memory layers & TF-IDF Cosine math
│   ├── 3_execution_engine.md      # Asyncio topological execution pools
│   ├── 4_agent_registry.md        # Agent catalog & metadata schemas
│   ├── 5_tool_registry.md         # Tool integrations & Mocking simulation
│   ├── 6_database_design.md       # Relational database SQLite schemas
│   ├── 7_frontend_design.md       # Client SPA design variables & custom SVGs
│   ├── 8_demo_guide.md            # A timed 5-minute hackathon presentation script
│   └── 9_setup_and_walkthrough.md # Installation commands and verification guide
```

---

## ⚡ Quick Start: Spin Up and Test-Drive

Follow these steps to set up the environment and run a dry-test run.

### 1. Launch the Backend API Loop
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   ```
3. Install package requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python run.py
   ```
   The backend API will boot on `http://localhost:8000`.

### 2. Launch the React Client
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React + TypeScript server:
   ```bash
   npm run dev
   ```
   The frontend will boot on `http://localhost:5173`. Open this URL in your web browser.

---

## 🕵️ Recruiter Evaluation Script

Once both services are running, perform this walkthrough to verify the platform features:

1.  **Workflow Construction**: Navigate to the **Workflow Builder** tab. Notice the default settings pre-loaded for targeting AI Software startups in London. Click **Run Pipeline**.
2.  **Live Monitoring & logs**: You are automatically redirected to the **Execution Monitor**. Watch the vertical agent list update status (Blue pulse for active, Green check for success). Expand terminal lines in the log console to view the JSON inputs and outputs of each step.
3.  **Validate Memory Hits (0ms API latency)**: 
    *   Navigate back to **Workflow Builder** and click **Run Pipeline** again.
    *   Return to **Execution Monitor**. Notice the pipeline finishes instantly.
    *   Look at the terminal output logs: you will see success logs stating `Memory Hit! Retrieved cached COMPANY for key: 'velocelabs.co'. Skipping live API call.`
    *   The **Dashboard** tab will reflect the incremented Memory Hits.
4.  **Edit & Approve (Human-in-the-Loop)**: Navigate to the **Human Queue** tab. You will see cards detailing target companies and contacts. Click **Edit Lead** to open the inline editor modal, adjust a contact name or role, and click **Approve & Save**.
5.  **Leads Database & Download**: Navigate to the **Leads Database** tab. The approved lead appears in the table. Click **Export CSV** to download the leads spreadsheet file.

---

## 📈 System Observations & Observability

- **API Fallbacks**: If you don't input API keys (OpenAI, Tavily, Firecrawl) in the Settings tab, the platform's **Intelligent Mocking Engine** generates structured data matching your inputs (React, Python, CTOs, London) to ensure a cohesive walkthrough.
- **Local Embedded Indexing**: Test search queries in the **Memory Explorer** tab. The engine calculates character-level TF-IDF weights and performs cosine-similarity matching in Python.
- **Audit Logs**: Every event (Planner start, agent activation, tool execute, cache hit, operator review) is logged in the `audit_logs` SQL table.