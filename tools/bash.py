import subprocess
from typing import Any

from .base import BaseTool, ToolResult


class BashTool(BaseTool):
    """Tool for executing bash commands."""

    name = "Bash"
    description = "Execute a bash command and return its output."

    def get_schema(self) -> dict[str, Any]:
        """Return the JSON schema for the Bash tool."""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The bash command to execute.",
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in seconds (default: 30).",
                        "default": 30,
                    },
                },
                "required": ["command"],
            },
        }

    def execute(self, command: str, timeout: int = 30) -> ToolResult:
        """Execute a bash command and return the result."""
        if not command:
            return ToolResult(
                success=False,
                output="",
                error="Command parameter is required.",
            )

        if not isinstance(timeout, int) or timeout < 1:
            timeout = 30

        max_timeout = 300
        if timeout > max_timeout:
            timeout = max_timeout

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
            )

            stdout = result.stdout.strip() if result.stdout else ""
            stderr = result.stderr.strip() if result.stderr else ""

            if result.returncode == 0:
                output = stdout
                if stderr:
                    output += f"\n[stderr]: {stderr}"
                return ToolResult(
                    success=True,
                    output=output if output else "(no output)",
                )
            else:
                error_msg = f"Command exited with code {result.returncode}"
                if stderr:
                    error_msg += f": {stderr}"
                return ToolResult(
                    success=False,
                    output=stdout,
                    error=error_msg,
                )

        except subprocess.TimeoutExpired:
            return ToolResult(
                success=False,
                output="",
                error=f"Command timed out after {timeout} seconds.",
            )
        except Exception as e:
            return ToolResult(
                success=False,
                output="",
                error=f"Failed to execute command: {str(e)}",
            )
