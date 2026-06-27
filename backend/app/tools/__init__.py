from backend.app.tools.registry import tool_registry
from backend.app.tools.web_search import WebSearchTool
from backend.app.tools.scraper import WebScraperTool
from backend.app.tools.export_tool import ExportTool

# Instantiate and register tools
web_search_tool = WebSearchTool()
web_scraper_tool = WebScraperTool()
export_tool = ExportTool()

tool_registry.register(web_search_tool)
tool_registry.register(web_scraper_tool)
tool_registry.register(export_tool)
