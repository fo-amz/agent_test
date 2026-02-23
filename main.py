#!/usr/bin/env python3
"""
Personal Assistant Agent - Main Entry Point

A minimal pi agent implementation with file operations and command execution tools.
"""

import sys

from config.settings import Settings
from llm.client import LLMClient
from prompts.system import SYSTEM_PROMPT
from tools import ToolRegistry, ReadTool, WriteTool, EditTool, BashTool


def create_tool_registry() -> ToolRegistry:
    """Create and populate the tool registry with available tools."""
    registry = ToolRegistry()
    registry.register(ReadTool())
    registry.register(WriteTool())
    registry.register(EditTool())
    registry.register(BashTool())
    return registry


def print_welcome():
    """Print welcome message and instructions."""
    print("=" * 60)
    print("🤖 Personal Assistant Agent")
    print("=" * 60)
    print()
    print("Available tools: Read, Write, Edit, Bash")
    print("Commands:")
    print("  - Type your message and press Enter to chat")
    print("  - Type 'clear' to clear conversation history")
    print("  - Type 'quit' or 'exit' to exit")
    print()
    print("-" * 60)


def run_agent_loop(llm_client: LLMClient):
    """Main agent loop for interacting with the user."""
    print_welcome()

    while True:
        try:
            user_input = input("\n📝 You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n👋 Goodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit"):
            print("\n👋 Goodbye!")
            break

        if user_input.lower() == "clear":
            llm_client.clear_history()
            print("🗑️  Conversation history cleared.")
            continue

        print("\n🤖 Assistant: ", end="", flush=True)

        try:
            response = llm_client.send_message(user_input, SYSTEM_PROMPT)
            print(response)
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


def main():
    """Main entry point for the personal assistant agent."""
    try:
        settings = Settings.from_env()
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("\nTo get started:")
        print("  1. Create a .env file in the project root")
        print("  2. Add: ANTHROPIC_API_KEY=your_api_key_here")
        print("  3. Run the agent again")
        sys.exit(1)

    tool_registry = create_tool_registry()
    llm_client = LLMClient(settings, tool_registry)

    run_agent_loop(llm_client)


if __name__ == "__main__":
    main()
