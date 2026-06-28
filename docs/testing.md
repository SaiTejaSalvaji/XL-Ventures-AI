---
title: "Testing Strategy"
description: "Testing approach, test suite structure, and coverage for VenturePilot AI"
---

# VenturePilot AI — Testing Strategy

## Overview

VenturePilot AI uses **pytest** as the testing framework with coverage reporting via `pytest-cov`. The test suite validates imports, agent contracts, output types, store operations, and FastAPI endpoints.

## Test Configuration

Defined in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
addopts = "-v --cov=src --cov-report=term-missing"
```

## Running Tests

```bash
# Full test suite with coverage
python -m pytest tests/ -v

# Single test file
python -m pytest tests/test_stubs.py -v

# Specific test class
python -m pytest tests/test_stubs.py::TestImports -v

# With coverage HTML report
python -m pytest tests/ --cov=src --cov-report=html
```

## Test Suite Structure

### `tests/test_stubs.py`

| Test Class | Tests | Purpose |
|------------|-------|---------|
| `TestImports` | 4 | Verify all modules are importable without errors |
| `TestBaseAgentContract` | 4 | Ensure all agents follow the BaseAgent interface |
| `TestAgentOutputTypes` | 11 | Validate all 11 agents return correct data types |
| `TestTools` | 6 | Unit tests for the tools package (search, scrape, news, contact) |
| `TestStore` | 9 | Full in-memory store CRUD operations |
| `TestFastAPIEndpoints` | 8 | API endpoint responses, 404s, approval workflow |

### Test Details

#### TestImports (4 tests)
- `test_llm_module` — `ask` and `ask_json` are callable
- `test_store_module` — `save_company`, `get_all_companies`, `create_job` are callable
- `test_all_agents_importable` — All 11 agent classes can be imported
- `test_fastapi_app` — FastAPI app instance is valid

#### TestBaseAgentContract (4 tests)
- `test_all_have_name` — Every agent has a unique `name` attribute
- `test_all_have_description` — Every agent has a non-empty `description`
- `test_all_have_run` — Every agent implements `run()` method
- `test_unique_names` — No two agents share the same name

#### TestAgentOutputTypes (11 tests)
- `test_planner_returns_list_of_strings` — PlannerAgent returns `list[str]`
- `test_discovery_returns_list` — DiscoveryAgent returns `list[dict]`
- `test_validation_keeps_companies` — ValidationAgent preserves company structure
- `test_scoring_returns_score_dict` — ScoringAgent returns dict with score, tier, breakdown
- `test_report_returns_string` — ReportAgent returns a string
- `test_github_returns_dict_with_required_keys` — GitHubAgent returns required metric keys
- `test_company_profile_returns_dict` — CompanyProfileAgent returns dict with company info
- `test_founder_profile_returns_list` — FounderProfileAgent returns list of founder profiles
- `test_market_analysis_returns_dict` — MarketAnalysisAgent returns competitive landscape
- `test_news_returns_dict` — NewsAgent returns sentiment + articles
- `test_contact_returns_dict` — ContactAgent returns email + linkedin

#### TestTools (6 tests)
- `test_search_tool_empty_keys_returns_empty` — Returns `[]` when API key missing
- `test_search_tool_empty_cse_id_returns_empty` — Returns `[]` when CSE ID missing
- `test_scraping_tool_empty_url_returns_empty` — Returns `""` when URL is empty
- `test_news_tool_empty_key_returns_empty` — Returns `[]` when API key missing
- `test_hunter_tool_generates_email` — Generates correct `first.last@domain` format
- `test_hunter_tool_single_name` — Handles single-word names gracefully

#### TestStore (9 tests)
- `test_save_and_retrieve_company` — Save a company and retrieve it by name
- `test_create_and_update_job` — Create a job and verify status updates
- `test_get_company_by_id` — Lookup company by UUID works
- `test_get_company_by_id_not_found` — Returns `None` for unknown ID
- `test_clear_companies` — `clear_companies()` empties the company store
- `test_save_and_get_report` — Report CRUD (save, get, miss)
- `test_save_and_get_decision` — Decision CRUD with notes
- `test_get_job_not_found` — Returns `None` for unknown job ID
- `test_update_job_non_existent_no_error` — Doesn't crash on missing job

#### TestFastAPIEndpoints (8 tests)
- `test_health` — `GET /health` returns 200 with service info
- `test_companies_empty` — `GET /companies` returns empty list on fresh start
- `test_analyze_returns_job_id` — `POST /analyze` returns job_id immediately
- `test_get_results_not_found` — `GET /results/{bad_id}` returns 404
- `test_get_company_report_not_found` — `GET /company/{bad_id}/report` returns 404
- `test_approve_company_not_found` — `POST /approve/{bad_id}` returns 404
- `test_approve_company_valid` — `POST /approve` records decision correctly
- `test_health_version` — Health response includes version field

## Coverage Report

Current coverage (42 tests passing):

| Module | Coverage |
|--------|----------|
| `app/agents/base_agent.py` | 85% |
| `app/agents/company_profile_agent.py` | 100% |
| `app/agents/contact_agent.py` | 100% |
| `app/agents/founder_profile_agent.py` | 100% |
| `app/agents/market_analysis_agent.py` | 100% |
| `app/agents/planner_agent.py` | 100% |
| `app/agents/report_agent.py` | 100% |
| `app/agents/scoring_agent.py` | 97% |
| `app/agents/news_agent.py` | 80% |
| `app/agents/validation_agent.py` | 75% |
| `app/main.py` | 91% |
| `app/memory/store.py` | 100% |
| `app/tools/hunter_tool.py` | 100% |
| `app/tools/news_tool.py` | 80% |
| `app/tools/scraping_tool.py` | 86% |
| **TOTAL** | **~68%** |

## Testing Principles

1. **Contract Testing** — Every agent must satisfy the BaseAgent interface (name, description, run).
2. **Type Safety** — Output types are validated to match expected structures.
3. **No External Calls** — Tests do not make real API calls; agents fall back to mocks.
4. **Idempotent** — Tests can be run in any order without side effects.
5. **Fast** — Full suite completes in ~20 seconds.

## Future Testing Improvements

- [ ] Integration tests for the full workflow pipeline
- [ ] Mock-based tests for LLM response parsing
- [ ] Frontend component tests (React Testing Library)
- [ ] API endpoint tests for `/analyze` with workflow mocking
- [ ] Load testing for concurrent workflow execution
