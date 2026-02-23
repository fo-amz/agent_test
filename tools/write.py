import os
from typing import Any

from .base import BaseTool, ToolResult


class WriteTool(BaseTool):
    """Tool for creating new files."""

    name = "Write"
    description = "Create a new file with the specified content. Fails if the file already exists."

    def get_schema(self) -> dict[str, Any]:
        """Return the JSON schema for the Write tool."""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The absolute path where the file should be created.",
                    },
                    "content": {
                        "type": "string",
                        "description": "The content to write to the file.",
                    },
                },
                "required": ["path", "content"],
            },
        }

    def execute(self, path: str, content: str) -> ToolResult:
        """Create a new file with the specified content."""
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

        if os.path.exists(path):
            return ToolResult(
                success=False,
                output="",
                error=f"File already exists: {path}. Use Edit tool to modify existing files.",
            )

        parent_dir = os.path.dirname(path)
        if parent_dir and not os.path.exists(parent_dir):
            try:
                os.makedirs(parent_dir, exist_ok=True)
            except PermissionError:
                return ToolResult(
                    success=False,
                    output="",
                    error=f"Permission denied creating directory: {parent_dir}",
                )

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            return ToolResult(
                success=True,
                output=f"Successfully created file: {path}",
            )
        except PermissionError:
            return ToolResult(
                success=False,
                output="",
                error=f"Permission denied: {path}",
            )
