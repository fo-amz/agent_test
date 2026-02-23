import os
from typing import Any

from .base import BaseTool, ToolResult


class EditTool(BaseTool):
    """Tool for editing existing files."""

    name = "Edit"
    description = "Edit an existing file by replacing a specific string with new content."

    def get_schema(self) -> dict[str, Any]:
        """Return the JSON schema for the Edit tool."""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The absolute path to the file to edit.",
                    },
                    "old_str": {
                        "type": "string",
                        "description": "The exact string to find and replace. Must be unique in the file.",
                    },
                    "new_str": {
                        "type": "string",
                        "description": "The replacement string.",
                    },
                },
                "required": ["path", "old_str", "new_str"],
            },
        }

    def execute(self, path: str, old_str: str, new_str: str) -> ToolResult:
        """Edit a file by replacing old_str with new_str."""
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
        except PermissionError:
            return ToolResult(
                success=False,
                output="",
                error=f"Permission denied reading: {path}",
            )
        except UnicodeDecodeError:
            return ToolResult(
                success=False,
                output="",
                error=f"Cannot read file as text (binary file?): {path}",
            )

        occurrences = content.count(old_str)
        if occurrences == 0:
            return ToolResult(
                success=False,
                output="",
                error=f"String not found in file: '{old_str[:100]}{'...' if len(old_str) > 100 else ''}'",
            )

        if occurrences > 1:
            return ToolResult(
                success=False,
                output="",
                error=f"String found {occurrences} times in file. It must be unique. Add more context to make it unique.",
            )

        new_content = content.replace(old_str, new_str)

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return ToolResult(
                success=True,
                output=f"Successfully edited file: {path}",
            )
        except PermissionError:
            return ToolResult(
                success=False,
                output="",
                error=f"Permission denied writing: {path}",
            )
