# Personal Assistant Agent

A minimal personal assistant agent built using the pi agent framework architecture. This agent interacts with an LLM (Claude/Anthropic) and provides tools for file operations and command execution.

## Features

- **Interactive Agent Loop**: Chat with the assistant in a conversational manner
- **File Operations**: Read, Write, and Edit files
- **Command Execution**: Run bash commands through the Bash tool
- **Tool Registry**: Extensible architecture for adding new tools
- **Conversation History**: Maintains context across multiple interactions

## Architecture

```
agent_test/
├── main.py                 # Main entry point with agent loop
├── tools/
│   ├── __init__.py
│   ├── base.py            # Base tool class and registry
│   ├── read.py            # Read file tool
│   ├── write.py           # Write file tool
│   ├── edit.py            # Edit file tool
│   └── bash.py            # Bash command execution tool
├── llm/
│   ├── __init__.py
│   └── client.py          # LLM client for Anthropic/Claude
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration module
├── prompts/
│   ├── __init__.py
│   └── system.py          # System prompt for the assistant
├── requirements.txt       # Dependencies
└── README.md              # This file
```

## Prerequisites

- Python 3.10 or higher
- An Anthropic API key

## Setup

1. **Clone the repository** (if not already done):
   ```bash
   cd /path/to/agent_test
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure your API key**:
   
   Create a `.env` file in the project root:
   ```bash
   ANTHROPIC_API_KEY=your_api_key_here
   ```

   Or export it in your shell:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## Configuration Options

The following environment variables can be configured in your `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) | - |
| `MODEL_NAME` | Claude model to use | `claude-sonnet-4-20250514` |
| `MAX_TOKENS` | Maximum tokens in response | `4096` |
| `TEMPERATURE` | Response creativity (0-1) | `0.7` |

## Running the Agent

```bash
python main.py
```

### Available Commands

- **Chat**: Type your message and press Enter
- **Clear history**: Type `clear` to reset conversation
- **Exit**: Type `quit` or `exit`

### Example Usage

```
============================================================
🤖 Personal Assistant Agent
============================================================

Available tools: Read, Write, Edit, Bash
Commands:
  - Type your message and press Enter to chat
  - Type 'clear' to clear conversation history
  - Type 'quit' or 'exit' to exit

------------------------------------------------------------

📝 You: Please list the files in the current directory

🤖 Assistant: I'll use the Bash tool to list the files.

🔧 Executing tool: Bash
   Input: {"command": "ls -la"}
   Success: True
   Output: total 32
drwxr-xr-x  6 user  staff   192 Jan  1 12:00 .
...

Here are the files in the current directory:
- main.py
- requirements.txt
- README.md
...
```

## Available Tools

### Read
Read the contents of a file.
```
Parameters:
  - path (string): Absolute path to the file
```

### Write
Create a new file with specified content.
```
Parameters:
  - path (string): Absolute path for the new file
  - content (string): Content to write
```

### Edit
Edit an existing file by string replacement.
```
Parameters:
  - path (string): Absolute path to the file
  - old_str (string): Exact string to replace (must be unique)
  - new_str (string): Replacement string
```

### Bash
Execute a bash command.
```
Parameters:
  - command (string): The bash command to execute
  - timeout (integer, optional): Timeout in seconds (default: 30)
```

## Extending with New Tools

To add a new tool:

1. Create a new file in the `tools/` directory
2. Extend the `BaseTool` class
3. Implement `get_schema()` and `execute()` methods
4. Register the tool in `main.py`

Example:
```python
from tools.base import BaseTool, ToolResult

class MyCustomTool(BaseTool):
    name = "MyTool"
    description = "Description of what this tool does."
    
    def get_schema(self):
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "param1": {"type": "string", "description": "..."}
                },
                "required": ["param1"]
            }
        }
    
    def execute(self, param1: str) -> ToolResult:
        # Your implementation here
        return ToolResult(success=True, output="Result")
```

## Security Considerations

- The agent can execute arbitrary bash commands - use with caution
- Keep your API key secure and never commit it to version control
- The Edit tool requires unique string matches to prevent unintended changes
- File operations require absolute paths to prevent directory traversal issues
