import os
from typing import Any

from .base import BaseTool, ToolResult


class ReadTool(BaseTool):
    """Tool for reading file contents."""

    name = "Read"
    description = "Read the contents of a file at the given path."

    def get_schema(self) -> dict[str, Any]:
        """Return the JSON schema for the Read tool."""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The absolute path to the file to read.",
                    }
                },
                "required": ["path"],
            },
        }

    def execute(self, path: str) -> ToolResult:
        """Read and return the contents of the specified file."""
        if not path:
            return ToolResult(
                success=False,
                output="",
                error="Path parameter is required.",
            )

        if not os.path.isabs(path):
            return ToolResult(
                success=False,
                output="",
                error=f"Path must be absolute. Received: {path}",
            )

        if not os.path.exists(path):
            return ToolResult(
                success=False,
                output="",
                error=f"File not found: {path}",
            )

        if not os.path.isfile(path):
            return ToolResult(
                success=False,
                output="",
                error=f"Path is not a file: {path}",
            )

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            return ToolResult(
                success=True,
                output=content,
            )
        except PermissionError:
            return ToolResult(
                success=False,
                output="",
                error=f"Permission denied: {path}",
            )
        except UnicodeDecodeError:
            return ToolResult(
                success=False,
                output="",
                error=f"Cannot read file as text (binary file?): {path}",
            )
