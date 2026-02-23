#!/usr/bin/env python3
"""
Personal Assistant API Server

Flask-based web server that exposes the LLMClient functionality as HTTP API endpoints.
"""

import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

from config.settings import Settings
from llm.client import LLMClient
from prompts.system import SYSTEM_PROMPT
from tools import ToolRegistry, ReadTool, WriteTool, EditTool, BashTool


app = Flask(__name__)
CORS(app)

# Global LLM client instance to maintain conversation history
llm_client = None


def create_tool_registry() -> ToolRegistry:
    """Create and populate the tool registry with available tools."""
    registry = ToolRegistry()
    registry.register(ReadTool())
    registry.register(WriteTool())
    registry.register(EditTool())
    registry.register(BashTool())
    return registry


def initialize_llm_client():
    """Initialize the LLM client with settings and tools."""
    global llm_client
    try:
        settings = Settings.from_env()
        tool_registry = create_tool_registry()
        llm_client = LLMClient(settings, tool_registry)
        return True
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        print("\nTo get started:")
        print("  1. Create a .env file in the project root")
        print("  2. Add: ANTHROPIC_API_KEY=your_api_key_here")
        print("  3. Run the server again")
        return False


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from the frontend.
    
    Expects JSON body:
    {
        "message": "user message string"
    }
    
    Returns JSON:
    {
        "response": "assistant response string"
    }
    
    Or on error:
    {
        "error": "error message string"
    }
    """
    global llm_client
    
    if llm_client is None:
        return jsonify({
            "error": "LLM client not initialized. Please check server configuration."
        }), 500
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "error": "Request body must be JSON"
            }), 400
        
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                "error": "Message is required and cannot be empty"
            }), 400
        
        response = llm_client.send_message(message, SYSTEM_PROMPT)
        
        return jsonify({
            "response": response
        })
        
    except Exception as e:
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/chat/clear', methods=['POST'])
def clear_history():
    """
    Clear the conversation history.
    
    Returns JSON:
    {
        "message": "Conversation history cleared"
    }
    """
    global llm_client
    
    if llm_client is None:
        return jsonify({
            "error": "LLM client not initialized. Please check server configuration."
        }), 500
    
    try:
        llm_client.clear_history()
        return jsonify({
            "message": "Conversation history cleared"
        })
    except Exception as e:
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns JSON:
    {
        "status": "healthy" or "unhealthy",
        "llm_client_initialized": true or false
    }
    """
    return jsonify({
        "status": "healthy" if llm_client is not None else "unhealthy",
        "llm_client_initialized": llm_client is not None
    })


def main():
    """Main entry point for the API server."""
    if not initialize_llm_client():
        sys.exit(1)
    
    print("=" * 60)
    print("🚀 Personal Assistant API Server")
    print("=" * 60)
    print()
    print("Server running at: http://localhost:5000")
    print()
    print("Available endpoints:")
    print("  POST /api/chat       - Send a message and get a response")
    print("  POST /api/chat/clear - Clear conversation history")
    print("  GET  /api/health     - Health check")
    print()
    print("-" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == "__main__":
    main()
