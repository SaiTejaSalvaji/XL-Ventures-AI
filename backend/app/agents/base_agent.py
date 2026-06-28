"""
base_agent.py — Abstract Base Class for all VenturePilot AI Agents

Every specialized agent must inherit from BaseAgent and implement:
  - `name`       : a unique string identifier (e.g. "discovery")
  - `description`: human-readable description of what the agent does
  - `run()`      : the main execution method

Design Notes:
  - Inputs and outputs are untyped here (dict/Any) so each agent can define
    its own Pydantic models (introduced in Stage 2) without breaking the contract.
  - `run()` is intentionally synchronous here; async support can be added in Stage 3
    when LangGraph's StateGraph integration is wired in.
  - Logging is set up at the base level so every agent emits structured logs.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any


logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all VenturePilot AI agents.

    Subclasses must define:
        - `name` (str)        : Unique agent identifier.
        - `description` (str) : What the agent does in plain English.
        - `run(**kwargs)`     : Main execution logic.
    """

    #: Unique string identifier for this agent (override in subclass)
    name: str = "base"

    #: Human-readable description shown in the UI and logs
    description: str = "Abstract base agent"

    def __init__(self):
        self.logger = logging.getLogger(f"agent.{self.name}")

    @abstractmethod
    def run(self, **kwargs) -> Any:
        """
        Execute the agent's primary task.

        Subclasses define their own typed parameters via **kwargs or by
        overriding this signature with concrete types (introduced in Stage 2).

        Returns:
            Any: Agent-specific output. Will be typed as Pydantic models in Stage 2.

        Raises:
            NotImplementedError: If not implemented by subclass.
            AgentError: If the agent encounters an unrecoverable error.
        """
        raise NotImplementedError(f"Agent '{self.name}' must implement run()")

    def log_start(self, context: dict | None = None):
        """Emit a structured log when the agent begins execution."""
        self.logger.info("Agent started", extra={"agent": self.name, "context": context or {}})

    def log_done(self, result_summary: str = ""):
        """Emit a structured log when the agent completes successfully."""
        self.logger.info(
            "Agent completed",
            extra={"agent": self.name, "summary": result_summary},
        )

    def log_error(self, error: Exception):
        """Emit a structured error log."""
        self.logger.error(
            "Agent failed",
            extra={"agent": self.name, "error": str(error)},
            exc_info=True,
        )

    def __repr__(self) -> str:
        return f"<Agent name={self.name!r}>"
