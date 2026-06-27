# 5. Tool Registry & Integration Tools

The **Tool Registry** manages external API connectors and utility libraries in ProspectPilot AI. It allows agents to dynamically call tools based on parameters, decoupling API client logic from core agent code.

---

## 1. Tool Base Configuration
Every integration inherits from `BaseTool` and registers inside the global `tool_registry` singleton.

```python
class BaseTool:
    name: str                   # Tool registry key
    description: str            # Details matching agent needs
    args_schema: Type[BaseModel] # Pydantic validation parameters
```

---

## 2. Core Sourcing Tools

### 1. Web Search Tool (`web_search`)
- **Connector**: Tavily API (Search API built for AI agents).
- **Arguments**: `query: str`
- **Logic**: Executes search requests. If no key is set in `TAVILY_API_KEY`, it falls back to the **Intelligent Mocking Engine** to search predefined local company lists matching the query keyword.

### 2. Web Scraper Tool (`web_scraper`)
- **Connector**: Firecrawl API (converts raw HTML pages into clean Markdown layouts).
- **Arguments**: `url: str`
- **Logic**: Fetches page content. If no key is set in `FIRECRAWL_API_KEY`, it reads matching company website text profiles from our local mock database.

### 3. Lead Exporter Tool (`export_tool`)
- **Format Options**: CSV, JSON, TXT.
- **Arguments**: `leads: List[dict], format_type: str, filename: str`
- **Logic**: Formats leads arrays and writes files to the `./exports/` folder, returning download links.

---

## 3. The Intelligent Mocking Engine

To ensure developers and judges can run the platform out-of-the-box without requiring active API keys, we built a local generative simulator in `backend/app/tools/mock_data.py`.

```
[Agent Tool Request] ---> [Check API Key]
                               |
            +------------------+------------------+
            | (Key Found)                         | (No Key)
            v                                     v
   [Trigger Live API]                   [Generative Mock Engine]
 (Tavily/Firecrawl/Hunter)                        |
            |                                     v
            |                           [Scan Local Templates]
            |                                     |
            v                                     v
    [Return Payload] <------------------ [Return Cohesive Data]
```

### Deterministic & Cohesive Fallback Data
If a query like "Find engineering hiring in London" is processed without an API key:
1. **Search Tool**: Evaluates the keyword and returns a list of mock entities (e.g. "Synthetix AI", "Cognitive Nexus").
2. **Scraper Tool**: When called for `synthetix.ai`, it loads the corresponding website text template from `MOCK_COMPANIES`, returning its custom tech stack (React, Python, PyTorch) and hiring status.
3. **Decision Maker & Contact**: Generates consistent contact names (e.g. "Sarah Jenkins, CTO") and matches them with domains (`sarah.jenkins@synthetix.ai`).
This ensures a cohesive demo experience where different tools return consistent, logical records for the same target company.
