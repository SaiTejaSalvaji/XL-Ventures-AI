# 8. Hackathon Demo Script & Presentation Guide

This script details a step-by-step 5-minute hackathon presentation flow designed to highlight the platform's architectural depth and business value.

---

## Time Allocation Summary

```
0:00 - 0:45 | 1. The Business Problem & Architectural Objective
0:45 - 2:00 | 2. Platform walk-through (Registries & Workflow)
2:00 - 3:00 | 3. Live Agent Execution & DAG Progress
3:00 - 4:00 | 4. Memory Cache Hit Demonstration
4:00 - 4:45 | 5. Human Review & Lead Export
4:45 - 5:00 | 6. Future Scalability Summary
```

---

## Step-by-Step Presentation Script

### 1. The Business Problem (0:00 - 0:45)
- **Goal**: Hook the judges immediately. Do not explain generic AI chatbots. Focus on business workflows.
- **Presenter Script**:
  > "Good afternoon judges. Sourcing high-value B2B accounts is slow and expensive, often relying on fragile, hardcoded automation. Today, we are presenting ProspectPilot AI—an enterprise-grade Agentic Sales Sourcing Platform.
  > Our architectural objective was not to build another chatbot, but a reusable, modular orchestrator capable of planning, executing, and validation. Let's look at the implementation."

### 2. Platform Walk-through (0:45 - 2:00)
- **Goal**: Show the Registries (Marketplace) and the Workflow Builder.
- **Presenter Script**:
  > "ProspectPilot AI is built on a plug-and-play architecture. Under the **Registry Catalog** tab, you can inspect our registered Agents and Tools. Each agent declares its own capabilities, schemas, tool dependencies, and retry policies.
  > Under the **Workflow Builder**, users configure sourcing rules without changing code. Here, we've set targeting criteria for London-based AI software startups hiring engineers.
  > In the background, our **Planner Agent** parses these criteria, matches appropriate agents, resolves parameter inputs, and formulates this Directed Acyclic Graph (DAG)."

### 3. Live Agent Execution (2:00 - 3:00)
- **Goal**: Click "Run Pipeline" and watch the Execution Monitor.
- **Presenter Script**:
  > "I will now trigger a live run. The platform redirects us to the **Execution Monitor**. Here, you can watch our asynchronous Execution Engine run the DAG.
  > Sibling tasks are run in parallel using python's `asyncio` to reduce latency.
  > On the right, the terminal displays the live audit log stream. You can expand these logs to view the JSON payloads passed between agents, showing full execution trace visibility."

### 4. Memory Cache Hit (3:00 - 4:00)
- **Goal**: Show intelligence by triggering a duplicate run.
- **Presenter Script**:
  > "Let's look at the **Memory Explorer**. A key problem in AI platforms is token spend and redundant API calls. ProspectPilot AI features a multi-tiered Memory Engine.
  > If we run the workflow again, notice that it completes instantly.
  > The terminal logs indicate a **Memory Hit**: the engine detected that these companies were enriched on the previous run, skipped live web search/scraping, and returned the cached data. This reduces token spend and brings latency to **0ms**."

### 5. Human Review & Lead Export (4:00 - 4:45)
- **Goal**: Show human-in-the-loop and CSV exports.
- **Presenter Script**:
  > "AI shouldn't send emails automatically without verification. Under the **Human Queue** tab, leads are held for review.
  > We can inspect the matched CTO, their verified email, and the outreach draft. If needed, we can click **Edit Lead** to adjust details before approving.
  > Once approved, the record moves to the **Leads Database** tab, where we can download the structured results as a formatted CSV spreadsheet."

### 6. Scalability Conclusion (4:45 - 5:00)
- **Goal**: Wrap up.
- **Presenter Script**:
  > "By separating concerns into independent engines, our architecture scales easily. The same platform can run other workflows simply by registering new agents. Thank you, and we'd love to take your questions."
