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
| `TestAgentOutputTypes` | 6 | Validate agents return correct data types |
| `TestStore` | 2 | Test in-memory store CRUD operations |
| `TestFastAPIEndpoints` | 2 | Test API endpoint responses |

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

#### TestAgentOutputTypes (6 tests)
- `test_planner_returns_list_of_strings` — PlannerAgent returns `list[str]`
- `test_discovery_returns_list` — DiscoveryAgent returns `list[dict]`
- `test_validation_keeps_companies` — ValidationAgent preserves company structure
- `test_scoring_returns_score_dict` — ScoringAgent returns dict with score, tier, breakdown
- `test_report_returns_string` — ReportAgent returns a string
- `test_github_returns_dict_with_required_keys` — GitHubAgent returns required metric keys

#### TestStore (2 tests)
- `test_save_and_retrieve_company` — Save a company and retrieve it by name
- `test_create_and_update_job` — Create a job and verify status updates

#### TestFastAPIEndpoints (2 tests)
- `test_health` — `GET /health` returns 200 with service info
- `test_companies_empty` — `GET /companies` returns empty list on fresh start

## Coverage Report

Current coverage (18 tests passing):

| Module | Coverage |
|--------|----------|
| `src/agents/base_agent.py` | 85% |
| `src/agents/planner_agent.py` | 100% |
| `src/agents/scoring_agent.py` | 97% |
| `src/agents/report_agent.py` | 100% |
| `src/agents/validation_agent.py` | 75% |
| `src/memory/store.py` | 70% |
| `src/llm.py` | 36% |
| `src/main.py` | 62% |
| **TOTAL** | **~53%** |

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
