---
title: "Contributing Guide"
description: "How to contribute to VenturePilot AI"
---

# Contributing to VenturePilot AI

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/XL-Ventures-AI.git
   cd XL-Ventures-AI
   ```
3. **Set up** the development environment:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install && cd ..
   cp .env.example .env
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Locally

```bash
# Backend (terminal 1)
python -m uvicorn src.main:app --reload

# Frontend (terminal 2)
cd frontend && npm run dev
```

### Running Tests

```bash
# Always run tests before committing
python -m pytest tests/ -v
```

### Code Formatting

```bash
# Python formatting
black src/ tests/ --line-length 100

# Python linting
flake8 src/ tests/

# Frontend linting
cd frontend && npm run lint
```

## Code Standards

### Python
- **Formatter**: Black (line length 100)
- **Linter**: Flake8
- **Import sorting**: isort (black-compatible profile)
- **Type hints**: Use Python 3.11+ type hints (`list[str]`, `dict | None`)
- **Docstrings**: Use triple-quoted docstrings for all public functions and classes

### TypeScript
- **Linter**: OxLint
- **Types**: Define all interfaces in `frontend/src/types/index.ts`
- **Components**: Use functional components with React hooks

### Agent Development
All agents must:
1. Inherit from `BaseAgent` (`src/agents/base_agent.py`)
2. Define a unique `name` string attribute
3. Define a `description` string attribute
4. Implement `run(**kwargs) -> Any`
5. Call `self.log_start()` and `self.log_done()` in the `run()` method
6. Handle errors gracefully with fallback values

Example:
```python
from .base_agent import BaseAgent
from ..llm import ask_json

class MyAgent(BaseAgent):
    name = "my_agent"
    description = "Does something useful."

    def run(self, company: dict | None = None, **kwargs) -> dict:
        company = company or {}
        self.log_start({"company": company.get("name")})
        # ... agent logic ...
        self.log_done("Task complete")
        return result
```

## Pull Request Process

1. Ensure all tests pass (`python -m pytest tests/ -v`).
2. Format your code with Black.
3. Update documentation if you've changed APIs or added features.
4. Write a clear PR description explaining what and why.
5. Reference any related issues.

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new agent for competitor analysis
fix: handle 429 rate limit in LLM fallback
docs: update API reference with new endpoint
test: add integration test for workflow runner
refactor: rename _gemini_discovery to _llm_discovery
```

## Reporting Issues

- Use the [GitHub Issues](https://github.com/SaiTejaSalvaji/XL-Ventures-AI/issues) tracker.
- Include: steps to reproduce, expected behavior, actual behavior, and relevant logs.
- Label issues appropriately (bug, enhancement, documentation).

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
