# VenturePilot AI (AgentOS) — Demo Execution & Pitch Guide

This guide describes how to run a flawless 5-minute demo and outlines the architectural talking points that will impress evaluators during an interview.

---

## 🚀 Step-by-Step Demo Flow

### Preparation
1. Create a copy of `.env.example` named `.env` and fill in your keys:
   - `GEMINI_API_KEY`: Required (Get a free key from [Google AI Studio](https://aistudio.google.com/apikey)).
   - `GITHUB_TOKEN`, `NEWSAPI_KEY`, `GOOGLE_CSE_API_KEY`: Optional (System uses realistic mock data if left blank).
2. Start the FastAPI backend:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```
3. Start the React dev server:
   ```bash
   cd frontend && npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

---

## 🎬 Demo Walkthrough Script (5 Minutes)

### 1. The Hook (0:00 - 0:45)
- **Action**: Show the landing page with the clean, premium dark-mode interface. Point out the live connection indicator in the top right ("AgentOS Backend: Live").
- **Voiceover**: 
  > "Today, B2B sales teams, VCs, and partnership managers spend hours manually scraping directories, websites, and news feeds to find ideal target opportunities. VenturePilot AI—or AgentOS—is an autonomous, multi-agent platform designed to automate this entire pipeline. We're going to demonstrate it using an Enterprise AI Startup Discovery case study."

---

### 2. Triggering the Workflow (0:45 - 1:45)
- **Action**: Point to the "Opportunity Parameters (ICP)" card. The fields are pre-filled with:
  - Industry: `AI Healthcare`
  - Funding Stage: `Seed`
  - Geography: `India`
- **Action**: Click the blue **"Trigger Discovery Workflow"** button.
- **Visuals**: The AgentOS Status card changes immediately to showing active nodes:
  - Discovery Agent starts spinning green.
  - Next, Validation Agent activates.
  - You see text indicators showing active targets: `enriching:Niramai Health Analytix`, `scoring:Tricog Health`, etc.
- **Voiceover**:
  > "By submitting our Ideal Customer Profile, we trigger our sequential agent workflow in a background thread. In the backend, our Planner Agent determines the list of sub-agents to invoke. Our Discovery Agent searches the web and local indexes, while our Validation Agent performs real-time domain reachability and registration checks."

---

### 3. Reviewing Scored Candidates (1:45 - 3:00)
- **Action**: Once the progress bar lights up green and shows **"done"**, scroll down to the "Discovered Opportunities Pipeline" table.
- **Action**: Sort by the **Score** column to show the high-scoring companies at the top.
- **Voiceover**:
  > "Once the pipeline completes, the opportunities are stored in our session database. They are automatically scored on a 100-point rubric assessing Team Quality, Technology Presence, Traction, and Market Opportunity. The table showcases our candidates sorted by interest score, along with key metadata and direct website links."

---

### 4. Due Diligence Drill-down (3:00 - 4:15)
- **Action**: Click on the top-ranked company (e.g. **Niramai Health Analytix**).
- **Visuals**: The page transitions smoothly into the drill-down view showing:
  - Big visual score ring.
  - Interactive progress bars for Team, Technology, Traction, and Market breakdown.
  - Leadership team bio (IIT alumni background highlights).
  - GitHub stars, forks, and last commit dates.
  - News headlines and positive/neutral sentiment badge.
  - A fully formed, multi-section Markdown report written by Gemini.
- **Voiceover**:
  > "If we click on a candidate, we see the full research synthesis. On the left, we see structured findings aggregated by our sub-agents: GitHub open-source code activity, News sentiment metrics, and competitor TAM estimation. On the right, we have a complete due-diligence report written autonomously by Gemini 1.5 Flash, summarizing market trends and risk factors."

---

### 5. Human-in-the-Loop Action (4:15 - 5:00)
- **Action**: Scroll to the "Reviewer Notes" text box. Type a quick comment: *"Strong founder background, high open-source activity. Moving to partner call."*
- **Action**: Click the green **"Approve Pipeline"** button.
- **Visuals**: A green alert banner pops up indicating that the decision was saved. Click "Back to Pipeline".
- **Voiceover**:
  > "Finally, we maintain a Human-in-the-Loop approach. Analysts can type reviews and record decisions. These decisions are recorded immediately in our backend. VenturePilot AI saves days of research by turning raw inputs into actionable, scored business opportunities in under 30 seconds. Thank you."

---

## 💡 Key Architectural Talking Points for Interviews

If the interviewer asks technical questions, focus on these highlights:

1. **Composition over Framework Lock-in**:
   > *"We chose a sequential Python threaded runner rather than LangGraph or CrewAI. This minimized setup overhead, made unit testing mock behaviors highly reliable, and kept the stack lightweight for standard web servers."*

2. **Deduplication and Resource Constraints**:
   > *"Every external API call has a fallback layer to prevent rate limit exceptions (100 free queries limit on Google CSE and NewsAPI). If keys are not present, the system defaults to realistic mock data, ensuring the prototype remains robust in test environments."*

3. **Stateless Tool Design**:
   > *"All external interfaces (e.g., BeautifulSoup parser, PyGithub connection) are stateless, side-effect-free helper methods in `src/tools/`. This cleanly separates API client details from agent orchestration logic."*

4. **In-Memory Thread Safety**:
   > *"Because FastAPI handles requests asynchronously, our runner updates thread-safe jobs and company dictionaries. This permits non-blocking dashboard status polling while backend agents perform long-running web requests."*
