from backend.app.agents.registry import agent_registry
from backend.app.agents.discovery import CompanyDiscoveryAgent
from backend.app.agents.validation import CompanyValidationAgent
from backend.app.agents.enrichment import CompanyEnrichmentAgent
from backend.app.agents.decision_maker import DecisionMakerAgent
from backend.app.agents.contact import ContactEnrichmentAgent
from backend.app.agents.recommendation import RecommendationAgent
from backend.app.agents.report import ReportAgent

# Instantiate and register agents
discovery_agent = CompanyDiscoveryAgent()
validation_agent = CompanyValidationAgent()
enrichment_agent = CompanyEnrichmentAgent()
decision_maker_agent = DecisionMakerAgent()
contact_agent = ContactEnrichmentAgent()
recommendation_agent = RecommendationAgent()
report_agent = ReportAgent()

agent_registry.register(discovery_agent)
agent_registry.register(validation_agent)
agent_registry.register(enrichment_agent)
agent_registry.register(decision_maker_agent)
agent_registry.register(contact_agent)
agent_registry.register(recommendation_agent)
agent_registry.register(report_agent)
