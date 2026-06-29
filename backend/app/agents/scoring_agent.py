"""
scoring_agent.py — Scoring Agent
Computes a weighted investment score and uses Gemini to write a rationale paragraph.
"""

from .base_agent import BaseAgent
from ..llm import ask


class ScoringAgent(BaseAgent):
    name = "scoring"
    description = "Scores companies on a 0-100 rubric and generates Gemini rationale."

    # Scoring weights
    WEIGHTS = {"team": 0.30, "technology": 0.25, "traction": 0.25, "market": 0.20}

    def run(self, profile: dict | None = None, **kwargs) -> dict:
        profile = profile or {}
        self.log_start({"company": profile.get("name")})

        icp = kwargs.get("icp") or {}
        min_score = icp.get("min_qualification_score", 70)

        breakdown = self._compute_breakdown(profile, icp)
        score = round(sum(
            breakdown[dim] * weight
            for dim, weight in self.WEIGHTS.items()
        ))
        
        # Calculate tier based on min_qualification_score
        if score >= min_score:
            tier = "High" if score >= min(100, min_score + 10) else "Medium"
        else:
            tier = "Low"

        rationale = self._gemini_rationale(profile, score, tier, breakdown)

        result = {"score": score, "tier": tier, "breakdown": breakdown, "rationale": rationale}
        self.log_done(f"Score: {score} ({tier})")
        return result

    def _compute_breakdown(self, p: dict, icp: dict) -> dict:
        """Rule-based scoring from available profile data, respecting ICP business rules."""
        # Team score
        founders = p.get("founders", [])
        team_score = min(100, 40 + len(founders) * 20)
        if any("IIT" in str(f) or "exit" in str(f).lower() for f in founders):
            team_score = min(100, team_score + 15)

        # Check target personas match
        target_personas = [pers.lower().strip() for pers in icp.get("target_personas", [])]
        if target_personas:
            found_titles = [f.get("title", "").lower() for f in founders]
            matching_personas = [t for t in found_titles if any(p_name in t for p_name in target_personas)]
            if matching_personas:
                team_score = min(100, team_score + 10)  # matching persona bonus

        # Tech score (GitHub signals)
        github = p.get("github", {})
        stars = github.get("total_stars", 0)
        tech_score = min(100, 40 + min(stars // 10, 40) + (10 if github.get("repo_count", 0) > 3 else 0))

        # Respect github activity trigger if selected
        triggers = icp.get("business_triggers", [])
        if "github_activity" in triggers and stars < 10:
            tech_score = max(30, tech_score - 15)  # penalize low github activity

        # Traction score (news + stage)
        news = p.get("news", {})
        sentiment = news.get("sentiment", "neutral")
        stage = p.get("stage", "")
        traction_base = {"Seed": 50, "Series A": 65, "Series B": 75, "Series C": 85}.get(stage, 45)
        traction_score = min(100, traction_base + (15 if sentiment == "positive" else 0))

        # Respect funding and positive sentiment triggers
        if "funding" in triggers:
            signals = [s.lower() for s in news.get("momentum_signals", [])]
            if any("funding" in sig or "investment" in sig or "raise" in sig for sig in signals):
                traction_score = min(100, traction_score + 10)
        if "sentiment_positive" in triggers and sentiment == "positive":
            traction_score = min(100, traction_score + 5)

        # Market score (from market analysis)
        market = p.get("market", {})
        market_stage = market.get("market_stage", "")
        market_score = {"emerging": 70, "growing": 80, "mature": 55}.get(market_stage, 60)

        return {
            "team": team_score,
            "technology": tech_score,
            "traction": traction_score,
            "market": market_score,
        }

    def _gemini_rationale(self, profile: dict, score: int, tier: str, breakdown: dict) -> str:
        name = profile.get("name", "this company")
        prompt = f"""
Write a concise 2-3 sentence investment rationale for {name}.
Score: {score}/100 ({tier} priority)
Team: {breakdown['team']}/100 | Tech: {breakdown['technology']}/100
Traction: {breakdown['traction']}/100 | Market: {breakdown['market']}/100
Industry: {profile.get('industry', '')} | Stage: {profile.get('stage', '')}

Be specific, professional, and mention both strengths and risks. Do NOT use markdown.
"""
        return ask(prompt, fallback=f"{name} scores {score}/100 ({tier} priority) based on team, technology, traction, and market analysis.")
