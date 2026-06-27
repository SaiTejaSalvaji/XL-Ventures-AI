import logging

from app.core.config import settings
from app.database.firestore_db import FirestoreDBClient
from app.utils.sse_stream_event_queue import SSEStreamEventQueue

logger = logging.getLogger("app.dependencies")

# Global Firestore DB client instance
db_client: FirestoreDBClient = None

# Global SSE event queue sessions
_sse_event_queue_sessions: dict[str, SSEStreamEventQueue] = {}


# ---------------------------------------------------------------------------
# Database dependency
# ---------------------------------------------------------------------------
async def get_cosmos_client() -> FirestoreDBClient:
    """Dependency to get the Firestore DB client (Cosmos-compatible interface)"""
    global db_client
    return db_client


# ---------------------------------------------------------------------------
# Service dependencies (all delegate into get_cosmos_client)
# ---------------------------------------------------------------------------
async def get_opportunity_service():
    """Dependency to get OpportunityService"""
    from app.services.opportunity_service import OpportunityService
    global db_client
    return OpportunityService(db_client)


async def get_analysis_service():
    """Dependency to get AnalysisService"""
    from app.services.analysis_service import AnalysisService
    global db_client
    return AnalysisService(db_client)


async def get_document_service():
    """Dependency to get DocumentService"""
    from app.services.document_service import DocumentService
    from app.utils.gcs_storage import get_gcs_storage_service
    global db_client
    storage = await get_gcs_storage_service()
    return DocumentService(db_client, storage)


async def get_document_processing_service():
    """Dependency to get DocumentProcessingService"""
    from app.services.document_processing_service import DocumentProcessingService
    global db_client
    return DocumentProcessingService(db_client)


async def get_analysis_workflow_events_service():
    """Dependency to get AnalysisWorkflowEventsService"""
    from app.services.analysis_workflow_events_service import AnalysisWorkflowEventsService
    global db_client
    return AnalysisWorkflowEventsService(db_client)


async def get_analysis_workflow_execution_service():
    """Dependency to get AnalysisWorkflowExecutorService"""
    from app.services.analysis_workflow_executor_service import AnalysisWorkflowExecutorService
    return AnalysisWorkflowExecutorService(
        analysis_service=await get_analysis_service(),
        opportunity_service=await get_opportunity_service(),
        workflow_events_service=await get_analysis_workflow_events_service()
    )


async def get_what_if_message_repository():
    """Dependency to get WhatIfMessageRepository"""
    from app.database.repositories import WhatIfMessageRepository
    global db_client
    return WhatIfMessageRepository(db_client)


async def get_what_if_workflow_executor_service():
    """Dependency to get WhatIfWorkflowExecutorService"""
    from app.services.whatif_workflow_executor_service import WhatIfWorkflowExecutorService
    service = WhatIfWorkflowExecutorService(
        analysis_service=await get_analysis_service(),
        what_if_message_repository=await get_what_if_message_repository()
    )
    await service.initialize()
    return service


# ---------------------------------------------------------------------------
# SSE event queue helpers
# ---------------------------------------------------------------------------
async def get_sse_event_queue_for_session(session_id: str):
    """Get the SSE event queue for a specific session"""
    global _sse_event_queue_sessions
    if session_id not in _sse_event_queue_sessions:
        _sse_event_queue_sessions[session_id] = SSEStreamEventQueue()
    return _sse_event_queue_sessions[session_id]


async def close_sse_event_queue_for_session(session_id: str):
    """Close and remove the SSE event queue for a specific session"""
    global _sse_event_queue_sessions
    if session_id in _sse_event_queue_sessions:
        await _sse_event_queue_sessions[session_id].clear_event_queue()
        del _sse_event_queue_sessions[session_id]


# ---------------------------------------------------------------------------
# AI Chat client - Vertex AI Gemini with local mock fallback
# ---------------------------------------------------------------------------
async def get_chat_client():
    """
    Return an AI chat client.

    When GCP_PROJECT_ID is configured, returns a Vertex AI Gemini-backed client
    (via agent_framework.google if available, or a lightweight wrapper).
    When credentials are absent, returns a MockChatClient that generates
    realistic placeholder analysis responses so the app runs fully offline.
    """
    from agent_framework import BaseChatClient

    is_mock = not settings.GCP_PROJECT_ID or "your-gcp-project" in settings.GCP_PROJECT_ID.lower()

    if is_mock:
        logger.info("Using MockChatClient (no GCP_PROJECT_ID configured)")
        return _build_mock_chat_client()

    # Try to use a Vertex AI Gemini client from agent_framework if available
    try:
        import vertexai
        from vertexai.generative_models import GenerativeModel

        vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_LOCATION)

        # Wrap inside a thin BaseChatClient-compatible class
        return _GeminiChatClient(
            project=settings.GCP_PROJECT_ID,
            location=settings.GCP_LOCATION,
            model_name=settings.GEMINI_MODEL_NAME
        )
    except Exception as e:
        logger.warning(f"Could not initialise Vertex AI Gemini client: {e}. Falling back to mock.")
        return _build_mock_chat_client()


def _build_mock_chat_client():
    """Build a simple mock chat client that returns realistic analysis text."""
    from agent_framework import BaseChatClient

    class MockChatClient(BaseChatClient):
        """Offline mock chat client returning realistic investment analysis text."""

        async def complete(self, messages, **kwargs):
            last_user_msg = next(
                (m.get("content", "") for m in reversed(messages) if m.get("role") == "user"),
                "the investment hypothesis"
            )
            mock_text = (
                f"## Investment Analysis Report\n\n"
                f"**Hypothesis Evaluated**: {last_user_msg}\n\n"
                f"### Executive Summary\n"
                f"Based on a comprehensive evaluation of financial metrics, market positioning, "
                f"risk exposure and regulatory compliance, this investment opportunity demonstrates "
                f"strong fundamentals with manageable downside risk.\n\n"
                f"### AI Agent Analysis\n"
                f"The target company shows consistent revenue growth (CAGR ~28%), healthy gross margins "
                f"above 65%, and an expanding total addressable market. The founding team brings "
                f"relevant domain expertise and prior exit experience.\n\n"
                f"### Conclusions\n"
                f"**Recommendation: Conditional Buy**. Subject to completion of technical due diligence "
                f"and reference checks, we recommend proceeding with an initial investment tranche.\n\n"
                f"### Sources\n"
                f"Company pitch deck, audited financials FY2022-2024, market research (Gartner 2024), "
                f"comparable transaction analysis."
            )

            class MockMessage:
                def __init__(self, text):
                    self.text = text
                    self.content = text

            class MockResponse:
                def __init__(self, text):
                    self.messages = [MockMessage(text)]
                    self.value = _MockAnalystResult(text)
                    self.text = text

            return MockResponse(mock_text)

    class _MockAnalystResult:
        def __init__(self, text):
            self.executive_summary = "Strong fundamentals with manageable downside risk."
            self.ai_agent_analysis = text
            self.conclusions = "Conditional Buy recommendation — proceed with initial tranche."
            self.sources = "Company pitch deck, audited financials, market research."

        def model_dump(self):
            return {
                "executive_summary": self.executive_summary,
                "ai_agent_analysis": self.ai_agent_analysis,
                "conclusions": self.conclusions,
                "sources": self.sources,
            }

    return MockChatClient()


class _GeminiChatClient:
    """Thin Vertex AI Gemini wrapper that matches the agent_framework chat client contract."""

    def __init__(self, project: str, location: str, model_name: str):
        self.project = project
        self.location = location
        self.model_name = model_name

    async def complete(self, messages, response_format=None, **kwargs):
        from vertexai.generative_models import GenerativeModel, Content, Part

        model = GenerativeModel(self.model_name)
        # Flatten all messages into a single prompt
        prompt = "\n".join(
            f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in messages
        )
        response = await model.generate_content_async(prompt)

        class _Message:
            def __init__(self, text):
                self.text = text
                self.content = text

        class _Response:
            def __init__(self, text):
                self.messages = [_Message(text)]
                self.text = text

        return _Response(response.text)


# ---------------------------------------------------------------------------
# Lifecycle management
# ---------------------------------------------------------------------------
async def initialize_all():
    """Initialize all GCP-backed dependencies on FastAPI startup."""
    logger.info("Initializing GCP dependencies...")
    try:
        global db_client
        if not db_client:
            db_client = FirestoreDBClient(
                project_id=settings.GCP_PROJECT_ID,
                database_id=settings.FIRESTORE_DATABASE_ID
            )
            await db_client.connect()

        # Initialize GCS storage
        from app.utils.gcs_storage import get_gcs_storage_service
        await get_gcs_storage_service()

        logger.info("All GCP dependencies initialised successfully.")
    except Exception as e:
        logger.error(f"Error during dependencies initialization: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


async def close_all():
    """Cleanly shut down all GCP dependencies on FastAPI shutdown."""
    global db_client
    if db_client:
        await db_client.close()

    from app.utils.gcs_storage import close_gcs_storage_service
    await close_gcs_storage_service()

