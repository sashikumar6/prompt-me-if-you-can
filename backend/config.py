import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(_BACKEND_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
AGENT_MODEL = os.getenv("OPENAI_AGENT_MODEL", OPENAI_MODEL)
GUARD_MODEL = os.getenv("OPENAI_GUARD_MODEL", OPENAI_MODEL)
JUDGE_MODEL = os.getenv("OPENAI_JUDGE_MODEL", OPENAI_MODEL)

# A fresh per-process canary is safer than a public constant in source control.
# Deployments can provide a stable high-entropy value when desired.
CANARY = os.getenv("FINGUARD_CANARY") or f"finguard-{secrets.token_urlsafe(24)}"

_cors_value = os.getenv(
    "CORS_ORIGINS",
    (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000"
    ),
)
CORS_ORIGINS = [origin.strip() for origin in _cors_value.split(",") if origin.strip()]
