---
title: "Troubleshooting Guide"
description: "Common issues and solutions for VenturePilot AI"
---

# VenturePilot AI — Troubleshooting Guide

## LLM & API Issues

### 429 RESOURCE_EXHAUSTED (Gemini)

**Symptom**: Backend logs show:
```
ERROR:src.llm:Gemini error: 429 RESOURCE_EXHAUSTED
Quota exceeded for metric: generate_content_free_tier_requests, limit: 20
```

**Cause**: Google Cloud free-tier API key is limited to 20 requests/day.

**Solution**:
1. **Configure Groq** (recommended): Set `GROQ_API_KEY` in `.env`. Groq offers 14,400 requests/day.
2. **Enable Billing**: Link a billing account to your GCP project to lift the 20 RPD limit.
3. **Wait**: The daily limit resets at midnight UTC.

### Groq Rate Limit

**Symptom**: `WARNING:src.llm:Groq rate limit hit`

**Cause**: Exceeded Groq's 30 RPM or 14,400 RPD limit.

**Solution**: Wait 60 seconds (RPM limit resets per-minute). The system will automatically fall back to Gemini.

### Model Not Found (404)

**Symptom**: `models/gemini-1.5-flash is not found for API version v1beta`

**Cause**: Using an old or incorrect model name.

**Solution**: The system uses `gemini-2.0-flash` by default. If you changed `_GEMINI_MODEL` in `llm.py`, revert it.

---

## Server Issues

### Port Already in Use

**Symptom**: `ERROR: [Errno 10048] Only one usage of each socket address is normally permitted`

**Cause**: Another process is using port 8000.

**Solution**:
```bash
# Find the process
netstat -ano | findstr :8000

# Kill it (replace PID)
taskkill /F /PID <PID>

# Or use a different port
python -m uvicorn src.main:app --port 8001 --reload
```

### Backend Not Starting

**Symptom**: ImportError or ModuleNotFoundError on startup.

**Solution**:
```bash
# Ensure dependencies are installed
pip install -r requirements.txt

# Run from the project root (not from src/)
python -m uvicorn src.main:app --reload
```

### Frontend Can't Connect to Backend

**Symptom**: Dashboard shows "AgentOS Backend: Offline" with red dot.

**Cause**: CORS issue or backend not running.

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check that `VITE_API_BASE_URL` in the frontend `.env` matches the backend URL.
3. Verify CORS is configured (should be `allow_origins=["*"]` for development).

---

## Data Issues

### "Still showing old companies"

**Symptom**: Dashboard displays results from a previous run.

**Cause**: The frontend React state wasn't cleared, or the new job hasn't completed yet.

**Solution**:
1. Wait for the workflow to finish (check the "AgentOS Status" panel).
2. Hard refresh the browser: `Ctrl + Shift + R`.
3. The companies list now clears automatically when a new analysis starts.

### Companies Show Empty Fields

**Symptom**: Company profiles have "N/A" or empty values for tagline, product, etc.

**Cause**: All LLM providers failed (rate-limited), and the fallback mocks were used.

**Solution**: Configure `GROQ_API_KEY` in `.env` to use Groq as the primary provider.

### In-Memory Store Reset

**Symptom**: All companies disappear after a backend code change.

**Cause**: Uvicorn's `--reload` flag restarts the server process, wiping the in-memory store.

**Solution**: This is expected behavior for the prototype. Re-run the analysis workflow.

---

## Environment Issues

### `.env` Not Loading

**Symptom**: `GEMINI_API_KEY not set — LLM calls will return placeholder text.`

**Cause**: `.env` file missing or not in the project root.

**Solution**:
```bash
# Create .env from template
cp .env.example .env

# Verify .env exists in the project root
ls -la .env
```

### API Key Has Extra Whitespace

**Symptom**: `401 Unauthorized` or `Invalid API key` despite correct key.

**Cause**: Copy-paste introduced leading/trailing whitespace.

**Solution**: The system calls `.strip()` on all API keys automatically. If still failing, manually check `.env` for invisible characters.

---

## Testing Issues

### Tests Fail with Import Errors

**Solution**:
```bash
# Install test dependencies
pip install pytest pytest-cov pytest-mock

# Run from project root
python -m pytest tests/ -v
```

### GitHub Deprecation Warning

**Symptom**: `DeprecationWarning: Argument login_or_token is deprecated`

**Cause**: PyGithub 2.x deprecated the old auth parameter.

**Solution**: This is a non-blocking warning. Tests still pass. To suppress:
```bash
python -m pytest tests/ -v -W ignore::DeprecationWarning
```

---

## Getting Help

If you encounter an issue not listed here:
1. Check the backend terminal logs for error messages.
2. Check the browser console (`F12` → Console) for frontend errors.
3. Verify all API keys in `.env` are valid and not expired.
4. Open an issue on the [GitHub repository](https://github.com/SaiTejaSalvaji/XL-Ventures-AI/issues).
