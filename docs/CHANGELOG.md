---
title: "Changelog"
description: "Version history and change log for VenturePilot AI"
---

# VenturePilot AI — Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-06-28

### Added
- **Multi-Agent Pipeline**: 11 specialized AI agents (Planner, Discovery, Validation, CompanyProfile, FounderProfile, GitHub, News, MarketAnalysis, Scoring, Report, Contact).
- **Groq LLM Integration**: Primary LLM provider using Llama-3.3-70b-versatile with 14,400 RPD free tier.
- **Gemini Fallback**: Auto-failover to Google Gemini 2.0 Flash when Groq is unavailable.
- **Smart Mock Fallback**: Deterministic mock generators for every agent type — ensures demo always works without API keys.
- **3-Tier LLM Routing**: `ask()` routes Groq → Gemini → Smart Mocks automatically.
- **FastAPI Backend**: REST API with endpoints for analysis, results polling, company listing, and HITL approval.
- **React Frontend**: Dashboard with ICP form, real-time agent progress, scored company pipeline table, and company detail pages.
- **HITL Workflow**: Human-in-the-Loop approval panel for analyst decisions (approve/reject/more_info).
- **Scoring Rubric**: Weighted investment scoring (Team 30%, Technology 25%, Traction 25%, Market 20%).
- **Due-Diligence Reports**: LLM-generated Markdown investment reports with 9 structured sections.
- **GitHub Integration**: Real GitHub org stats via PyGithub (stars, forks, languages, commit dates).
- **News Sentiment**: NewsAPI integration with LLM-based sentiment classification.
- **Google CSE Discovery**: Real web search for startup discovery with fallback chains.
- **Dynamic Mock Companies**: Industry-adaptive mock company generator for any search query.
- **pytest Suite**: 18 verification tests covering imports, contracts, output types, store, and API endpoints.
- **Comprehensive Documentation**: Architecture, components, API reference, data model, setup guide, tech stack, testing, and troubleshooting docs.

### Changed
- Replaced Gemini-only LLM routing with Groq-primary + Gemini-fallback chain.
- Updated MarketAnalysisAgent fallback to use dynamic industry labels instead of hardcoded healthcare terms.
- Renamed `_gemini_discovery` to `_llm_discovery` for provider-agnostic naming.

### Fixed
- Frontend dashboard now clears previous results immediately when starting a new analysis.
- API key whitespace handling with `.strip()` to prevent auth failures from copy-paste errors.
- CORS configuration set to `allow_credentials=False` to prevent preflight blockage.

---

## [Unreleased]

### Planned
- [ ] LangGraph StateGraph integration for parallel agent execution
- [ ] PostgreSQL persistent storage (replacing in-memory dict)
- [ ] User authentication and multi-tenant support
- [ ] Async agent execution with asyncio
- [ ] Frontend test suite (React Testing Library)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization
- [ ] Rate limit aware scheduling across LLM providers
