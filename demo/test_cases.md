# VenturePilot AI — Test Cases & Validation Script

Use these test cases to verify the API, background worker, in-memory database, and frontend dashboard.

---

## 🧪 Test Case 1: Liveness Probe (Health Check)
**Goal**: Verify that the FastAPI backend server is running and accessible.

### Step-by-Step
Run this in your terminal or use a tool like Postman:
```bash
curl http://127.0.0.1:8000/health
```

### Expected Output
```json
{
  "status": "ok",
  "service": "VenturePilot AI",
  "version": "1.0.0"
}
```

---

## 🧪 Test Case 2: Triggering Discovery Workflow
**Goal**: Submit an ICP request and start the multi-agent execution pipeline in the background.

### Step-by-Step
Execute the following POST request:
```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"industry": "AI Healthcare", "stage": "Seed", "location": "India", "tech_keywords": ["ML", "imaging"]}'
```

### Expected Output
```json
{
  "job_id": "some-random-uuid-string",
  "status": "running"
}
```
*Note down the returned `job_id` for Test Case 3.*

---

## 🧪 Test Case 3: Polling Workflow Status & Progress
**Goal**: Verify that the workflow runner updates states (discovery → validation → enrichment → done) and stores results.

### Step-by-Step
Poll the results endpoint using the `job_id` from Test Case 2 (replace `YOUR_JOB_ID`):
```bash
curl http://127.0.0.1:8000/results/YOUR_JOB_ID
```

### Expected Outputs
1. **While Running**:
   ```json
   {
     "job_id": "YOUR_JOB_ID",
     "status": "running",
     "current_step": "enriching:Niramai Health Analytix",
     "companies": []
   }
   ```
2. **Once Done** (takes ~15-25 seconds depending on Gemini response speed):
   ```json
   {
     "job_id": "YOUR_JOB_ID",
     "status": "done",
     "current_step": null,
     "companies": [
       {
         "id": "company-uuid",
         "name": "Niramai Health Analytix",
         "url": "https://niramai.com",
         "score": 85,
         "tier": "High",
         "report": "# Niramai Health Analytix ...",
         ...
       }
     ]
   }
   ```

---

## 🧪 Test Case 4: Fetching Scored Opportunities List
**Goal**: Ensure the list of all analyzed companies is persisted and sorted by score descending.

### Step-by-Step
Request all companies in the system:
```bash
curl http://127.0.0.1:8000/companies
```

### Expected Output
```json
{
  "companies": [
    {
      "name": "Company with High Score",
      "score": 85,
      "tier": "High"
    },
    {
      "name": "Company with Medium Score",
      "score": 62,
      "tier": "Medium"
    }
  ],
  "total": 2
}
```

---

## 🧪 Test Case 5: Human-in-the-Loop Approval
**Goal**: Verify reviews and approval decisions are recorded for a company.

### Step-by-Step
1. Grab a `company_id` from the list in Test Case 4.
2. Send an approval post (replace `YOUR_COMPANY_ID`):
```bash
curl -X POST http://127.0.0.1:8000/approve/YOUR_COMPANY_ID \
  -H "Content-Type: application/json" \
  -d '{"decision": "approve", "notes": "Strong developer traction on GitHub and excellent market TAM."}'
```

### Expected Output
```json
{
  "company_id": "YOUR_COMPANY_ID",
  "company_name": "Niramai Health Analytix",
  "decision": "approve",
  "status": "recorded"
}
```

---

## 🧪 Test Case 6: Retrieving Full Gemini Report
**Goal**: Request the generated Markdown due-diligence report text separately.

### Step-by-Step
Request report for a company (replace `YOUR_COMPANY_ID`):
```bash
curl http://127.0.0.1:8000/company/YOUR_COMPANY_ID/report
```

### Expected Output
```json
{
  "company_id": "YOUR_COMPANY_ID",
  "company_name": "Niramai Health Analytix",
  "report": "# Niramai Health Analytix — Due Diligence Report\n\n## Executive Summary\n..."
}
```
