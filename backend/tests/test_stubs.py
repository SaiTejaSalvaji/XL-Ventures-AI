"""
test_stubs.py — Verification Tests
Verifies all agents are importable, follow BaseAgent contract, and produce correct output types.
"""

import pytest


class TestImports:
    def test_llm_module(self):
        from app.llm import ask, ask_json
        assert callable(ask) and callable(ask_json)

    def test_store_module(self):
        from app.memory import store
        assert callable(store.save_company)
        assert callable(store.get_all_companies)
        assert callable(store.create_job)

    def test_all_agents_importable(self):
        from app.agents.planner_agent import PlannerAgent
        from app.agents.discovery_agent import DiscoveryAgent
        from app.agents.validation_agent import ValidationAgent
        from app.agents.company_profile_agent import CompanyProfileAgent
        from app.agents.founder_profile_agent import FounderProfileAgent
        from app.agents.github_agent import GitHubAgent
        from app.agents.market_analysis_agent import MarketAnalysisAgent
        from app.agents.news_agent import NewsAgent
        from app.agents.contact_agent import ContactAgent
        from app.agents.scoring_agent import ScoringAgent
        from app.agents.report_agent import ReportAgent
        assert all([PlannerAgent, DiscoveryAgent, ValidationAgent,
                    CompanyProfileAgent, FounderProfileAgent, GitHubAgent,
                    MarketAnalysisAgent, NewsAgent, ContactAgent,
                    ScoringAgent, ReportAgent])

    def test_fastapi_app(self):
        from app.main import app
        assert app.title == "VenturePilot AI"


class TestBaseAgentContract:
    def _agents(self):
        from app.agents.planner_agent import PlannerAgent
        from app.agents.discovery_agent import DiscoveryAgent
        from app.agents.validation_agent import ValidationAgent
        from app.agents.company_profile_agent import CompanyProfileAgent
        from app.agents.founder_profile_agent import FounderProfileAgent
        from app.agents.github_agent import GitHubAgent
        from app.agents.market_analysis_agent import MarketAnalysisAgent
        from app.agents.news_agent import NewsAgent
        from app.agents.contact_agent import ContactAgent
        from app.agents.scoring_agent import ScoringAgent
        from app.agents.report_agent import ReportAgent
        return [PlannerAgent(), DiscoveryAgent(), ValidationAgent(),
                CompanyProfileAgent(), FounderProfileAgent(), GitHubAgent(),
                MarketAnalysisAgent(), NewsAgent(), ContactAgent(),
                ScoringAgent(), ReportAgent()]

    def test_all_have_name(self):
        for a in self._agents():
            assert isinstance(a.name, str) and len(a.name) > 0

    def test_all_have_description(self):
        for a in self._agents():
            assert isinstance(a.description, str) and len(a.description) > 0

    def test_all_have_run(self):
        for a in self._agents():
            assert callable(getattr(a, "run", None))

    def test_unique_names(self):
        names = [a.name for a in self._agents()]
        assert len(names) == len(set(names))


class TestAgentOutputTypes:
    """Verify agents return correct types (no API calls — uses mock/fallback)."""

    SAMPLE_COMPANY = {
        "name": "TestCo AI", "url": "https://example.com",
        "industry": "AI Healthcare", "stage": "Seed", "location": "India",
        "description": "AI-powered diagnostics platform",
    }

    def test_planner_returns_list_of_strings(self):
        from app.agents.planner_agent import PlannerAgent
        result = PlannerAgent().run(icp={"industry": "AI"})
        assert isinstance(result, list)
        assert all(isinstance(s, str) for s in result)
        assert len(result) > 0

    def test_discovery_returns_list(self):
        from app.agents.discovery_agent import DiscoveryAgent
        result = DiscoveryAgent().run(icp={"industry": "AI Healthcare", "location": "India"})
        assert isinstance(result, list)
        assert len(result) > 0  # mock data always returns results
        assert "name" in result[0]

    def test_validation_keeps_companies(self):
        from app.agents.validation_agent import ValidationAgent
        companies = [self.SAMPLE_COMPANY.copy()]
        result = ValidationAgent().run(companies=companies)
        assert isinstance(result, list)
        # Always keeps at least 1 for demo safety
        assert len(result) >= 1

    def test_scoring_returns_score_dict(self):
        from app.agents.scoring_agent import ScoringAgent
        profile = {**self.SAMPLE_COMPANY,
                   "founders": [{"name": "Test Founder"}],
                   "github": {"total_stars": 500, "repo_count": 5},
                   "news": {"sentiment": "positive"},
                   "market": {"market_stage": "growing"}}
        result = ScoringAgent().run(profile=profile)
        assert "score" in result
        assert "tier" in result
        assert isinstance(result["score"], int)
        assert 0 <= result["score"] <= 100
        assert result["tier"] in ("High", "Medium", "Low")

    def test_report_returns_string(self):
        from app.agents.report_agent import ReportAgent
        result = ReportAgent().run(profile=self.SAMPLE_COMPANY)
        assert isinstance(result, str)
        assert len(result) > 50  # Has actual content

    def test_github_returns_dict_with_required_keys(self):
        from app.agents.github_agent import GitHubAgent
        result = GitHubAgent().run(company=self.SAMPLE_COMPANY)
        assert "total_stars" in result
        assert "repo_count" in result

    def test_company_profile_returns_dict(self):
        from app.agents.company_profile_agent import CompanyProfileAgent
        result = CompanyProfileAgent().run(company=self.SAMPLE_COMPANY)
        assert isinstance(result, dict)
        assert "name" in result

    def test_founder_profile_returns_list(self):
        from app.agents.founder_profile_agent import FounderProfileAgent
        result = FounderProfileAgent().run(company=self.SAMPLE_COMPANY)
        assert isinstance(result, list)
        if result:
            assert "name" in result[0]
            assert "title" in result[0]

    def test_market_analysis_returns_dict(self):
        from app.agents.market_analysis_agent import MarketAnalysisAgent
        result = MarketAnalysisAgent().run(company=self.SAMPLE_COMPANY)
        assert isinstance(result, dict)
        assert "competitors" in result
        assert "tam_estimate" in result
        assert "market_stage" in result

    def test_news_returns_dict(self):
        from app.agents.news_agent import NewsAgent
        result = NewsAgent().run(company=self.SAMPLE_COMPANY)
        assert isinstance(result, dict)
        assert "sentiment" in result
        assert "summary" in result

    def test_contact_returns_dict(self):
        from app.agents.contact_agent import ContactAgent
        result = ContactAgent().run(founder={"name": "Test Person"}, domain="example.com")
        assert isinstance(result, dict)
        assert "email" in result
        assert "linkedin_url" in result
        assert "confidence_score" in result


class TestTools:
    def test_search_tool_empty_keys_returns_empty(self):
        from app.tools.search_tool import google_cse_search
        result = google_cse_search("AI startups", "", "")
        assert result == []

    def test_search_tool_empty_cse_id_returns_empty(self):
        from app.tools.search_tool import google_cse_search
        result = google_cse_search("AI startups", "some-key", "")
        assert result == []

    def test_scraping_tool_empty_url_returns_empty(self):
        from app.tools.scraping_tool import scrape_website
        result = scrape_website("")
        assert result == ""

    def test_news_tool_empty_key_returns_empty(self):
        from app.tools.news_tool import fetch_news
        result = fetch_news("TestCo", "")
        assert result == []

    def test_hunter_tool_generates_email(self):
        from app.tools.hunter_tool import generate_contact
        result = generate_contact("John Doe", "testco.com")
        assert result["email"] == "john.doe@testco.com"
        assert "linkedin.com/in/" in result["linkedin_url"]

    def test_hunter_tool_single_name(self):
        from app.tools.hunter_tool import generate_contact
        result = generate_contact("John", "testco.com")
        assert "john@testco.com" in result["email"]

    def test_hunter_tool_confidence_full_info(self):
        from app.tools.hunter_tool import generate_contact
        result = generate_contact("John Doe", "testco.com")
        assert result["confidence_score"] >= 80

    def test_hunter_tool_confidence_unknown(self):
        from app.tools.hunter_tool import generate_contact
        result = generate_contact("Unknown", "")
        assert result["confidence_score"] <= 50


class TestStore:
    def setup_method(self):
        from app.memory.store import clear_companies
        clear_companies()

    def test_save_and_retrieve_company(self):
        from app.memory import store
        company = {"name": "TestCo", "score": 82, "tier": "High"}
        store.save_company(company)
        result = store.get_company("TestCo")
        assert result is not None
        assert result["score"] == 82

    def test_create_and_update_job(self):
        from app.memory import store
        job_id = store.create_job({"industry": "AI"})
        assert store.get_job(job_id)["status"] == "queued"
        store.update_job(job_id, status="done")
        assert store.get_job(job_id)["status"] == "done"

    def test_get_company_by_id(self):
        from app.memory import store
        from app.memory.store import clear_companies
        clear_companies()
        company = {"name": "IDTestCo", "score": 75}
        store.save_company(company)
        result = store.get_company_by_id(company["id"])
        assert result is not None
        assert result["name"] == "IDTestCo"

    def test_get_company_by_id_not_found(self):
        from app.memory.store import get_company_by_id
        assert get_company_by_id("nonexistent-id") is None

    def test_clear_companies(self):
        from app.memory import store
        from app.memory.store import clear_companies
        store.save_company({"name": "ClearMe"})
        clear_companies()
        assert len(store.get_all_companies()) == 0

    def test_save_and_get_report(self):
        from app.memory import store
        store.save_report("TestCo", "## Due Diligence Report")
        assert store.get_report("TestCo") == "## Due Diligence Report"
        assert store.get_report("NoSuchCo") is None

    def test_save_and_get_decision(self):
        from app.memory import store
        store.save_decision("co-1", "approve", "Looks good")
        decision = store.get_decision("co-1")
        assert decision["decision"] == "approve"
        assert decision["notes"] == "Looks good"
        assert store.get_decision("nonexistent") is None

    def test_get_job_not_found(self):
        from app.memory import store
        assert store.get_job("bad-job-id") is None

    def test_update_job_non_existent_no_error(self):
        from app.memory import store
        store.update_job("no-such-job", status="done")
        assert store.get_job("no-such-job") is None


class TestFastAPIEndpoints:
    def test_health(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_companies_empty(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.memory.store import clear_companies
        clear_companies()
        client = TestClient(app)
        resp = client.get("/companies")
        assert resp.status_code == 200
        assert isinstance(resp.json()["companies"], list)

    def test_analyze_returns_job_id(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.memory.store import clear_all
        clear_all()
        client = TestClient(app)
        resp = client.post("/analyze", json={
            "industry": "AI Healthcare",
            "stage": "Seed",
            "location": "India",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "job_id" in data
        assert data["status"] == "running"

    def test_get_results_not_found(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        resp = client.get("/results/nonexistent-job")
        assert resp.status_code == 404

    def test_get_company_report_not_found(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        resp = client.get("/company/nonexistent-id/report")
        assert resp.status_code == 404

    def test_approve_company_not_found(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        resp = client.post("/approve/nonexistent-id", json={"decision": "approve"})
        assert resp.status_code == 404

    def test_approve_company_valid(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.memory.store import clear_companies
        clear_companies()
        from app.memory import store
        company = {"name": "ApprovalTest", "industry": "AI", "stage": "Seed"}
        store.save_company(company)
        client = TestClient(app)
        resp = client.post(f"/approve/{company['id']}", json={
            "decision": "approve",
            "notes": "Great potential",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["company_name"] == "ApprovalTest"
        assert data["decision"] == "approve"

    def test_health_version(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.json()["version"] == "1.0.0"
