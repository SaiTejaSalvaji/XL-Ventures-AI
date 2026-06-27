from typing import Dict, List, Any
from backend.app.agents.base import BaseAgent

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent):
        self._agents[agent.name] = agent

    def get_agent(self, name: str) -> BaseAgent:
        return self._agents.get(name)

    def list_agents(self) -> List[Dict[str, Any]]:
        return [agent.get_metadata() for agent in self._agents.values()]

agent_registry = AgentRegistry()
