from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ToolResult:
    """Result of a tool execution."""

    success: bool
    output: str
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for API responses."""
        result = {"success": self.success, "output": self.output}
        if self.error:
            result["error"] = self.error
        return result


class BaseTool(ABC):
    """Base class for all tools."""

    name: str
    description: str

    @abstractmethod
    def get_schema(self) -> dict[str, Any]:
        """Return the JSON schema for this tool's parameters."""
        pass

    @abstractmethod
    def execute(self, **kwargs) -> ToolResult:
        """Execute the tool with the given parameters."""
        pass


class ToolRegistry:
    """Registry for managing and dispatching tool calls."""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a tool in the registry."""
        self._tools[tool.name] = tool

    def get_tool(self, name: str) -> BaseTool | None:
        """Get a tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> list[str]:
        """List all registered tool names."""
        return list(self._tools.keys())

    def get_all_schemas(self) -> list[dict[str, Any]]:
        """Get schemas for all registered tools (Anthropic format)."""
        return [tool.get_schema() for tool in self._tools.values()]

    def execute(self, tool_name: str, **kwargs) -> ToolResult:
        """Execute a tool by name with the given parameters."""
        tool = self.get_tool(tool_name)
        if tool is None:
            return ToolResult(
                success=False,
                output="",
                error=f"Unknown tool: {tool_name}. Available tools: {self.list_tools()}",
            )
        try:
            return tool.execute(**kwargs)
        except Exception as e:
            return ToolResult(
                success=False,
                output="",
                error=f"Tool execution failed: {str(e)}",
            )
