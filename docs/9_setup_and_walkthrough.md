# 9. System Setup & Walkthrough Guide

This chapter details the prerequisites, local installation, and walk-through steps to verify the platform features.

---

## 1. System Prerequisites
Ensure your local environment has the following software installed:
- **Node.js**: v22+ (npm v11+)
- **Python**: v3.12+

---

## 2. Installation & Run Settings

### Backend API Server Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python run.py
   ```
   The backend service starts on `http://localhost:8000`.

### Frontend React Client Setup
1. Open a separate terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install node packages:
   ```bash
   npm install
   ```
3. Run the Vite client:
   ```bash
   npm run dev
   ```
   The frontend UI starts on `http://localhost:5173`. Open this URL in your web browser.

### Containerized Docker Setup (Production Profile)
To run the entire platform inside container networks:
1. Build and spin up the container services from the root folder:
   ```bash
   docker-compose up --build
   ```
2. Access the components:
   *   **Vite React Client (Served via Nginx)**: `http://localhost/` (Port 80)
   *   **FastAPI API Gateway**: `http://localhost:8000/`

---

## 3. Automated Verification Testing
We have built an automated integration test suite in `backend/test_platform.py` to test our Planner DAG sorting, the LTM cache database checks, and character bi-gram vector similarities.

Run the suite inside the `backend/` directory:
```bash
python test_platform.py
```

---

## 4. Step-by-Step System Walkthrough

### Step 1: Criteria Configuration
- Open the UI and select the **Workflow Builder** tab.
- Change targeting criteria values (Industry, Location, Headcount limits, Technologies, or Personas) and click **Save Config**.
- Click **Run Pipeline** to compile the DAG and trigger execution.

### Step 2: Telemetry Monitoring
- The interface automatically moves you to the **Execution Monitor** tab.
- Observe the step nodes transition from pending (gray) to running (pulsing blue) and success (green check).
- Check the console stream on the right for audit logs and expand log headers to view intermediate JSON variables.

### Step 3: Verifying Memory Hits
- Return to **Workflow Builder** and click **Run Pipeline** again.
- Move to **Execution Monitor**. Notice the run resolves instantly.
- The logs print `[MemoryEngine] [SUCCESS] Memory Hit! Retrieved cached COMPANY for key: 'velocelabs.co'. Skipping live API call.`
- View the **Dashboard** metrics to see the updated Memory Hits count.

### Step 4: Operator Approvals & Exports
- Open the **Human Queue** tab.
- Check prospect details. Click **Edit Lead** to open the details editor, adjust variables, and click **Approve & Save**.
- Navigate to the **Leads Database** tab to view approved records and download formatted **CSV** or **JSON** files.
