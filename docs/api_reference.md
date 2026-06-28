---
title: "API Reference"
description: "REST API endpoint documentation for VenturePilot AI"
---

# VenturePilot AI — API Reference

## Base URL

```
http://localhost:8000
```

Auto-generated OpenAPI docs available at: `http://localhost:8000/docs`

---

## Endpoints

### `GET /health`

Health check endpoint.

**Response** `200 OK`
```json
{
  "status": "ok",
  "service": "VenturePilot AI",
  "version": "1.0.0"
}
```

---

### `POST /analyze`

Trigger the full multi-agent analysis pipeline for a given ICP. Returns immediately with a job ID; poll `/results/{job_id}` for progress.

**Request Body**
```json
{
  "industry": "AI Healthcare",
  "stage": "Seed",
  "location": "India",
  "tech_keywords": ["machine learning", "AI"]
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `industry` | string | `"AI Healthcare"` | Target industry vertical |
| `stage` | string | `"Seed"` | Funding stage filter |
| `location` | string | `"India"` | Geographic focus |
| `tech_keywords` | string[] | `["machine learning", "AI"]` | Technology keyword filters |

**Response** `200 OK`
```json
{
  "job_id": "b4c91cb5-5fd9-4039-95da-87b773bb216e",
  "status": "running"
}
```

**Side Effects**
- Clears the entire in-memory store (`store.clear_all()`)
- Creates a new job record
- Launches the workflow in a background thread

---

### `GET /results/{job_id}`

Poll the status of a running analysis job.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string (UUID) | The job ID returned by `/analyze` |

**Response** `200 OK` (while running)
```json
{
  "job_id": "b4c91cb5-...",
  "status": "running",
  "current_step": "enriching:Acme Corp",
  "companies": []
}
```

**Response** `200 OK` (when done)
```json
{
  "job_id": "b4c91cb5-...",
  "status": "done",
  "current_step": null,
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "score": 78,
      "tier": "High",
      "industry": "AI Healthcare",
      "founders": [...],
      "github": {...},
      "news": {...},
      "market": {...},
      "report": "# Acme Corp — Due Diligence Report\n..."
    }
  ]
}
```

**Response** `404 Not Found`
```json
{
  "detail": "Job not found"
}
```

**Status Values**: `queued` → `running` → `done` | `error`

**Current Step Format**:
- `"discovery"` — running discovery agent
- `"validation"` — validating URLs
- `"enriching:{company_name}"` — enriching a specific company
- `"scoring:{company_name}"` — scoring a company
- `"report:{company_name}"` — generating report
- Error message string (when status is `"error"`)

---

### `GET /companies`

Return all discovered and enriched companies, sorted by score (descending).

**Response** `200 OK`
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "score": 78,
      "tier": "High",
      ...
    }
  ],
  "total": 3
}
```

---

### `POST /approve/{company_id}`

Record a Human-in-the-Loop (HITL) decision for a company.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `company_id` | string (UUID) | The company's unique ID |

**Request Body**
```json
{
  "decision": "approve",
  "notes": "Strong team, good market fit"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision` | string | Yes | `"approve"`, `"reject"`, or `"more_info"` |
| `notes` | string | No | Optional analyst notes |

**Response** `200 OK`
```json
{
  "company_id": "uuid",
  "company_name": "Acme Corp",
  "decision": "approve",
  "status": "recorded"
}
```

**Response** `404 Not Found`
```json
{
  "detail": "Company not found"
}
```

---

### `GET /company/{company_id}/report`

Retrieve the AI-generated due-diligence report for a specific company.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `company_id` | string (UUID) | The company's unique ID |

**Response** `200 OK`
```json
{
  "company_id": "uuid",
  "company_name": "Acme Corp",
  "report": "# Acme Corp — Due Diligence Report\n\n## Executive Summary\n..."
}
```

**Response** `404 Not Found`
```json
{
  "detail": "Company not found"
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error description string"
}
```

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `404` | Resource not found (job or company) |
| `422` | Validation error (invalid request body) |
| `500` | Internal server error |

## CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> ⚠️ **Note**: CORS is set to allow all origins for development. Restrict this in production.
