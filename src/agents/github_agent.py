"""
github_agent.py — GitHub Agent
Fetches real GitHub stats via PyGithub. Falls back gracefully if org not found.
"""

import os
from .base_agent import BaseAgent


class GitHubAgent(BaseAgent):
    name = "github"
    description = "Fetches GitHub activity metrics using the GitHub REST API."

    def run(self, company: dict | None = None, **kwargs) -> dict:
        company = company or {}
        self.log_start({"company": company.get("name")})

        token = os.getenv("GITHUB_TOKEN", "")
        if not token:
            self.logger.info("GITHUB_TOKEN not set — returning mock GitHub data")
            return self._mock_data(company)

        name = company.get("name", "")
        metrics = self._fetch_github(name, token)
        self.log_done(f"GitHub: {metrics.get('total_stars', 0)} stars")
        return metrics

    def _fetch_github(self, company_name: str, token: str) -> dict:
        try:
            from github import Github, GithubException
            g = Github(token)
            # Try to find the org by searching
            query = company_name.lower().replace(" ", "-")
            try:
                org = g.get_organization(query)
                repos = list(org.get_repos())[:10]
                stars = sum(r.stargazers_count for r in repos)
                forks = sum(r.forks_count for r in repos)
                languages = list({r.language for r in repos if r.language})[:5]
                last_push = max(
                    (r.pushed_at for r in repos if r.pushed_at), default=None
                )
                return {
                    "repo_count": len(repos),
                    "total_stars": stars,
                    "total_forks": forks,
                    "last_commit_date": last_push.isoformat() if last_push else None,
                    "primary_languages": languages,
                    "github_org_url": f"https://github.com/{query}",
                    "source": "github_api",
                }
            except GithubException:
                return self._mock_data({"name": company_name})
        except Exception as e:
            self.logger.warning(f"GitHub API error: {e}")
            return self._mock_data({"name": company_name})

    def _mock_data(self, company: dict) -> dict:
        import random
        return {
            "repo_count": random.randint(2, 15),
            "total_stars": random.randint(50, 2000),
            "total_forks": random.randint(10, 300),
            "last_commit_date": "2024-06-15T10:00:00",
            "primary_languages": ["Python", "JavaScript"],
            "github_org_url": None,
            "source": "mock",
        }
