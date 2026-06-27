# 2. Memory Engine Deep Dive

The **Memory Engine** is a critical system module in ProspectPilot AI. It provides intelligent context reuse and semantic retrieval layers, ensuring the platform avoids duplicate search/scraping cost, speeds up execution times to 0ms on cached records, and matches leads with high accuracy.

---

## 1. The Five Layers of Memory

```
+---------------------------------------------------------------------------------+
|                                 MEMORY ENGINE                                   |
+---------------------------------------------------------------------------------+
| 1. Working Memory    | Scoped to the active running task (transient memory).    |
+----------------------+----------------------------------------------------------+
| 2. Short-Term Memory | Scoped to the entire DAG execution run.                  |
+----------------------+----------------------------------------------------------+
| 3. Long-Term Memory  | Persistent database cache (caching companies & contacts).|
+----------------------+----------------------------------------------------------+
| 4. Semantic Memory   | Cosine Similarity vector database lookup.                |
+----------------------+----------------------------------------------------------+
| 5. Knowledge Memory  | Active workspace qualification policies and settings.   |
+---------------------------------------------------------------------------------+
```

### 1. Working Memory
- **Scope**: Task level.
- **Lifetime**: Discarded as soon as the active agent completes its execution block.
- **Purpose**: Holds parameters and scrape texts parsed locally by the agent parser.

### 2. Short-Term Memory
- **Scope**: Run level (keyed by `execution_id`).
- **Lifetime**: Persists for the duration of the workflow graph run.
- **Purpose**: Stores outputs of parent nodes. For example, the `CompanyDiscoveryAgent` writes its findings to Short-Term Memory, which the `CompanyValidationAgent` subsequently reads.

### 3. Long-Term Memory (LTM)
- **Scope**: Platform level.
- **Lifetime**: Permanent (persisted in the SQLite `memory_entries` database table).
- **Purpose**: Acts as an entity cache. When an agent seeks to enrich a company domain (e.g. `cognitivenexus.com`), it queries LTM first:
  ```python
  cached_profile = memory.check_long_term("COMPANY", "cognitivenexus.com")
  ```
  If found, the Memory Engine returns the data, logs a **Memory Hit** success event, increments the execution stats counter, and skips the external web scraper run. This reduces Tavily/Firecrawl token spending and lowers execution latency to **0ms**.

### 4. Semantic Memory
- **Scope**: Platform level.
- **Lifetime**: Permanent.
- **Purpose**: Evaluates similarity between search queries and cached textual records using vector representations.

### 5. Knowledge Memory
- **Scope**: Workspace level.
- **Lifetime**: Permanent (until updated by setting forms).
- **Purpose**: Stores active qualification rules (minimum headcounts, technology target arrays, target personas) configured by the user.

---

## 2. Local Semantic Search Algorithm

To ensure the platform operates out-of-the-box on local dev cycles without requiring heavy vector databases (like ChromaDB or Milvus), we built a custom vector index.

### Embedding Formulation (Character n-gram TF-IDF)
The text is decomposed into bi-grams (two-letter substrings). Each bi-gram is hashed into a fixed-length 128-dimensional floating-point array:
$$\text{Vector}[H(\text{bigram}) \pmod{128}] += 1.0$$
The vector is normalized to unit length to support cosine comparison:
$$\mathbf{v}_{\text{normalized}} = \frac{\mathbf{v}}{\|\mathbf{v}\|}$$

### Cosine Similarity Search
When a user runs a semantic query, the platform calculates its embedding and computes the dot product against all entries stored in the `semantic_memories` table:
$$\text{Similarity}(\mathbf{q}, \mathbf{m}) = \sum_{i=1}^{128} q_i \cdot m_i$$
Matches are sorted in descending order and returned with a percentage confidence rating, providing semantic lookups without database dependencies.
