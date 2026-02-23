import os
from dataclasses import dataclass
from dotenv import load_dotenv


@dataclass
class Settings:
    """Configuration settings for the personal assistant agent."""

    anthropic_api_key: str
    model_name: str
    max_tokens: int
    temperature: float

    @classmethod
    def from_env(cls) -> "Settings":
        """Load settings from environment variables."""
        load_dotenv()

        anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not anthropic_api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY environment variable is required. "
                "Set it in a .env file or export it in your shell."
            )

        return cls(
            anthropic_api_key=anthropic_api_key,
            model_name=os.getenv("MODEL_NAME", "claude-sonnet-4-20250514"),
            max_tokens=int(os.getenv("MAX_TOKENS", "4096")),
            temperature=float(os.getenv("TEMPERATURE", "0.7")),
        )


settings = Settings.from_env() if os.getenv("ANTHROPIC_API_KEY") else None
