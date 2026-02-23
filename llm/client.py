import json
from typing import Any

import anthropic

from config.settings import Settings
from tools import ToolRegistry


class LLMClient:
    """Client for communicating with Claude/Anthropic API."""

    def __init__(self, settings: Settings, tool_registry: ToolRegistry):
        self.settings = settings
        self.tool_registry = tool_registry
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.conversation_history: list[dict[str, Any]] = []

    def send_message(self, user_message: str, system_prompt: str) -> str:
        """Send a message to the LLM and process the response, handling tool calls."""
        self.conversation_history.append({"role": "user", "content": user_message})

        while True:
            response = self._call_api(system_prompt)
            assistant_content = response.content
            self.conversation_history.append(
                {"role": "assistant", "content": assistant_content}
            )

            if response.stop_reason == "tool_use":
                tool_results = self._process_tool_calls(assistant_content)
                self.conversation_history.append(
                    {"role": "user", "content": tool_results}
                )
            else:
                return self._extract_text_response(assistant_content)

    def _call_api(self, system_prompt: str) -> Any:
        """Make an API call to Claude."""
        return self.client.messages.create(
            model=self.settings.model_name,
            max_tokens=self.settings.max_tokens,
            system=system_prompt,
            tools=self.tool_registry.get_all_schemas(),
            messages=self.conversation_history,
        )

    def _process_tool_calls(
        self, assistant_content: list[Any]
    ) -> list[dict[str, Any]]:
        """Process tool calls from the assistant's response."""
        tool_results = []

        for block in assistant_content:
            if block.type == "tool_use":
                tool_name = block.name
                tool_input = block.input
                tool_use_id = block.id

                print(f"\n🔧 Executing tool: {tool_name}")
                print(f"   Input: {json.dumps(tool_input, indent=2)}")

                result = self.tool_registry.execute(tool_name, **tool_input)

                print(f"   Success: {result.success}")
                if result.output:
                    output_preview = (
                        result.output[:200] + "..."
                        if len(result.output) > 200
                        else result.output
                    )
                    print(f"   Output: {output_preview}")
                if result.error:
                    print(f"   Error: {result.error}")

                content = result.output if result.success else result.error
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": content or "(no output)",
                        "is_error": not result.success,
                    }
                )

        return tool_results

    def _extract_text_response(self, assistant_content: list[Any]) -> str:
        """Extract text content from the assistant's response."""
        text_parts = []
        for block in assistant_content:
            if hasattr(block, "text"):
                text_parts.append(block.text)
        return "\n".join(text_parts) if text_parts else "(No response)"

    def clear_history(self) -> None:
        """Clear the conversation history."""
        self.conversation_history = []
