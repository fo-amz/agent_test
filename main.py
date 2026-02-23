#!/usr/bin/env python3
"""
Personal Assistant Agent - Main Entry Point

A minimal pi agent implementation with file operations and command execution tools.
Includes web server with voice interaction capabilities.
"""

import sys
import os
import tempfile
import io
import argparse
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from config.settings import Settings
from llm.client import LLMClient
from prompts.system import SYSTEM_PROMPT
from tools import ToolRegistry, ReadTool, WriteTool, EditTool, BashTool

# Voice processing imports
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: whisper not available. Speech-to-text will be disabled.")

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

if not PYTTSX3_AVAILABLE and not GTTS_AVAILABLE:
    print("Warning: No TTS library available. Text-to-speech will be disabled.")


# FastAPI app
app = FastAPI(title="Personal Assistant Agent", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
llm_client: LLMClient = None
whisper_model = None
tts_engine = None

# Temporary directory for audio files
AUDIO_TEMP_DIR = tempfile.mkdtemp(prefix="assistant_audio_")


class ChatMessage(BaseModel):
    """Request model for chat messages."""
    message: str
    generate_audio: bool = False


class ChatResponse(BaseModel):
    """Response model for chat messages."""
    text: str
    audio_url: str | None = None


class TranscriptionResponse(BaseModel):
    """Response model for transcription."""
    text: str


def create_tool_registry() -> ToolRegistry:
    """Create and populate the tool registry with available tools."""
    registry = ToolRegistry()
    registry.register(ReadTool())
    registry.register(WriteTool())
    registry.register(EditTool())
    registry.register(BashTool())
    return registry


def init_whisper_model():
    """Initialize the Whisper model for speech-to-text."""
    global whisper_model
    if WHISPER_AVAILABLE and whisper_model is None:
        print("Loading Whisper model (small)...")
        whisper_model = whisper.load_model("small")
        print("Whisper model loaded.")
    return whisper_model


def init_tts_engine():
    """Initialize the TTS engine."""
    global tts_engine
    if PYTTSX3_AVAILABLE and tts_engine is None:
        tts_engine = pyttsx3.init()
        tts_engine.setProperty('rate', 150)
    return tts_engine


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using Whisper."""
    if not WHISPER_AVAILABLE:
        raise HTTPException(status_code=503, detail="Whisper model not available")
    
    model = init_whisper_model()
    result = model.transcribe(audio_path)
    return result["text"].strip()


def generate_tts_audio(text: str, output_path: str) -> str:
    """Generate TTS audio from text."""
    if GTTS_AVAILABLE:
        tts = gTTS(text=text, lang='en')
        tts.save(output_path)
        return output_path
    elif PYTTSX3_AVAILABLE:
        engine = init_tts_engine()
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        return output_path
    else:
        raise HTTPException(status_code=503, detail="No TTS engine available")


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(audio: UploadFile = File(...)):
    """Transcribe uploaded audio file to text."""
    if not WHISPER_AVAILABLE:
        raise HTTPException(status_code=503, detail="Speech-to-text not available")
    
    # Save uploaded audio to temp file
    suffix = Path(audio.filename).suffix if audio.filename else ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=AUDIO_TEMP_DIR) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        text = transcribe_audio(tmp_path)
        return TranscriptionResponse(text=text)
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatMessage):
    """Send a text message and get a response."""
    global llm_client
    
    if llm_client is None:
        raise HTTPException(status_code=503, detail="LLM client not initialized")
    
    try:
        response_text = llm_client.send_message(request.message, SYSTEM_PROMPT)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    audio_url = None
    if request.generate_audio and (GTTS_AVAILABLE or PYTTSX3_AVAILABLE):
        # Generate audio response
        audio_filename = f"response_{os.urandom(8).hex()}.mp3"
        audio_path = os.path.join(AUDIO_TEMP_DIR, audio_filename)
        try:
            generate_tts_audio(response_text, audio_path)
            audio_url = f"/api/audio/{audio_filename}"
        except Exception as e:
            print(f"TTS generation failed: {e}")
    
    return ChatResponse(text=response_text, audio_url=audio_url)


@app.post("/api/chat/voice", response_model=ChatResponse)
async def voice_chat_endpoint(
    audio: UploadFile = File(...),
    generate_audio: bool = True
):
    """Send voice message and get response with optional audio."""
    global llm_client
    
    if llm_client is None:
        raise HTTPException(status_code=503, detail="LLM client not initialized")
    
    if not WHISPER_AVAILABLE:
        raise HTTPException(status_code=503, detail="Speech-to-text not available")
    
    # Save and transcribe audio
    suffix = Path(audio.filename).suffix if audio.filename else ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=AUDIO_TEMP_DIR) as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Transcribe
        user_text = transcribe_audio(tmp_path)
        print(f"Transcribed: {user_text}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    
    # Get LLM response
    try:
        response_text = llm_client.send_message(user_text, SYSTEM_PROMPT)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Generate audio response if requested
    audio_url = None
    if generate_audio and (GTTS_AVAILABLE or PYTTSX3_AVAILABLE):
        audio_filename = f"response_{os.urandom(8).hex()}.mp3"
        audio_path = os.path.join(AUDIO_TEMP_DIR, audio_filename)
        try:
            generate_tts_audio(response_text, audio_path)
            audio_url = f"/api/audio/{audio_filename}"
        except Exception as e:
            print(f"TTS generation failed: {e}")
    
    return ChatResponse(text=response_text, audio_url=audio_url)


@app.get("/api/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio files."""
    audio_path = os.path.join(AUDIO_TEMP_DIR, filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


@app.post("/api/tts")
async def tts_endpoint(text: str):
    """Generate TTS audio from text."""
    if not (GTTS_AVAILABLE or PYTTSX3_AVAILABLE):
        raise HTTPException(status_code=503, detail="TTS not available")
    
    audio_filename = f"tts_{os.urandom(8).hex()}.mp3"
    audio_path = os.path.join(AUDIO_TEMP_DIR, audio_filename)
    
    try:
        generate_tts_audio(text, audio_path)
        return JSONResponse({"audio_url": f"/api/audio/{audio_filename}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history")
async def clear_history():
    """Clear conversation history."""
    global llm_client
    if llm_client:
        llm_client.clear_history()
    return JSONResponse({"status": "cleared"})


@app.get("/api/status")
async def status():
    """Get server status and available features."""
    return JSONResponse({
        "status": "running",
        "features": {
            "speech_to_text": WHISPER_AVAILABLE,
            "text_to_speech": GTTS_AVAILABLE or PYTTSX3_AVAILABLE,
            "tts_engine": "gtts" if GTTS_AVAILABLE else ("pyttsx3" if PYTTSX3_AVAILABLE else None)
        }
    })


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


def run_agent_loop(client: LLMClient):
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
            client.clear_history()
            print("🗑️  Conversation history cleared.")
            continue

        print("\n🤖 Assistant: ", end="", flush=True)

        try:
            response = client.send_message(user_input, SYSTEM_PROMPT)
            print(response)
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


def run_web_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the FastAPI web server."""
    global llm_client
    
    # Mount static files for frontend
    src_dir = Path(__file__).parent / "src"
    if src_dir.exists():
        app.mount("/", StaticFiles(directory=str(src_dir), html=True), name="static")
    
    # Pre-load Whisper model if available
    if WHISPER_AVAILABLE:
        init_whisper_model()
    
    print(f"Starting web server at http://{host}:{port}")
    print(f"Features: STT={'✓' if WHISPER_AVAILABLE else '✗'}, TTS={'✓' if (GTTS_AVAILABLE or PYTTSX3_AVAILABLE) else '✗'}")
    
    uvicorn.run(app, host=host, port=port)


def main():
    """Main entry point for the personal assistant agent."""
    global llm_client
    
    parser = argparse.ArgumentParser(description="Personal Assistant Agent")
    parser.add_argument("--web", action="store_true", help="Run as web server")
    parser.add_argument("--host", default="0.0.0.0", help="Web server host")
    parser.add_argument("--port", type=int, default=8000, help="Web server port")
    args = parser.parse_args()
    
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

    if args.web:
        run_web_server(args.host, args.port)
    else:
        run_agent_loop(llm_client)


if __name__ == "__main__":
    main()
