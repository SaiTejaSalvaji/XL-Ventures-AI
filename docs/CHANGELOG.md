---
title: "Changelog"
description: "Version history and change log for VenturePilot AI"
---

# VenturePilot AI — Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-06-29

### Added
- **Cloud Deployment**: Full production deployment across Vercel (frontend), Render (backend), and cron-job.org (keep-alive).
- **Vercel Frontend Hosting**: Static SPA served via Vercel CDN edge network at [xl-ventures-ai.vercel.app](https://xl-ventures-ai.vercel.app/).
- **Render Backend Hosting**: FastAPI backend deployed as a free web service on Render.
- **Keep-Alive Cron Job**: cron-job.org scheduled task pings `/health` every 14 minutes to prevent Render cold starts.
- **Serverless Frontend Fallback**: Rich mock data pipeline in `client.ts` ensures the frontend works standalone when the backend is sleeping.
- **CI/CD Pipeline**: GitHub Actions workflow for automated backend (pytest) and frontend (npm test) testing on push/PR.
- **Deployment Documentation**: Comprehensive cloud deployment guides in README and `docs/setup_deployment.md`.
- **Architecture Diagrams**: Mermaid deployment topology diagrams showing Vercel ↔ Render ↔ cron-job.org flow.

### Changed
- README restructured with Live Demo section, Cloud Deployment Details, and Quick Links table.
- Docker setup renamed from "Recommended" to "Local" to distinguish from cloud deployment.
- Architecture docs updated with both local and cloud deployment topologies.

---

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
- [x] ~~CI/CD pipeline (GitHub Actions)~~ — Added in v0.2.0
- [x] ~~Docker containerization~~ — Added in v0.1.0
- [ ] Rate limit aware scheduling across LLM providers

