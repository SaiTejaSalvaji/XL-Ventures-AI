# 4. Agent Registry & Agent Catalog

The **Agent Registry** manages and serves all intelligent agents inside ProspectPilot AI. By avoiding hardcoded execution chains, the registry enables plug-and-play expandability for the platform.

---

## 1. Registry Architecture
Every agent is a Python class that inherits from the abstract `BaseAgent` parent class. On platform boot, agents in `backend/app/agents/` are initialized and registered.

### Base Agent Definition
```python
class BaseAgent:
    name: str                   # Registry key name
    description: str            # Detailed capability descriptor
    capabilities: List[str]     # Array of tasks this agent can solve
    input_schema: Type[BaseModel] # Pydantic schema for validation
    output_schema: Type[BaseModel] # Pydantic schema for outputs
    tool_dependencies: List[str] # Tool tags required for run
    priority: int               # Execution precedence weight (1-10)
    retry_policy: Dict[str, Any] # Max retries and backoff rules
    memory_access: bool         # Toggles access to long-term memory
```

---

## 2. Dynamic Verification via Pydantic
The registry enforces strict payload boundaries:
- **Input Validation**: Before invoking `run()`, the execution engine compares inputs against the agent's `input_schema`. If parameters are missing, it throws a type validation exception before calling tools, saving API cost.
- **Output Validation**: Upon execution completion, outputs are parsed against `output_schema` to ensure downstream dependencies receive valid data structure attributes.

---

## 3. Individual Sourcing Agents Specifications

### 1. Trigger Monitor Agent
- **Description**: Monitors event signals (recent funding announcements, headcount growth spikes, or technology changes).
- **Capability**: `detect_triggers`
- **Logic**: Evaluates search listings to surface active triggers (e.g. Series B raise).

### 2. Company Discovery Agent
- **Description**: Formulates searches based on target industry and location settings to find matching prospects.
- **Tools**: `web_search`

### 3. Company Validation Agent
- **Description**: Verifies domains, checks for syntax issues, and checks the database memory for duplicate entries.
- **Logic**: Performs LTM cache matches. If found, returns the record and sets `memory_hit = True`.

### 4. Company Enrichment Agent
- **Description**: Scrapes target websites to extract technology stacks, active openings, locations, and profiles.
- **Tools**: `web_scraper`

### 5. Decision Maker Agent
- **Description**: Matches active target role profiles (e.g., CTO, VP of Eng) against the contacts found during scraping.
- **Logic**: Selects the best match from the prospect catalog.

### 6. Contact Enrichment Agent
- **Description**: Fetches prospect email addresses and LinkedIn profiles, calculating verification confidence ratings.

### 7. Recommendation Agent
- **Description**: Grades target fitness (0.0 to 1.0) based on stack alignment and hiring activity. It also writes email drafts.

### 8. Report Agent
- **Description**: Consolidates lead details and runs export tools to write CSV/JSON reports.
