from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI, OpenAIError

from agent import call_agent
from config import CORS_ORIGINS, OPENAI_API_KEY
from guardrails import (
    encoding_abuse,
    output_scan,
    persona_override,
    pii_detection,
    prompt_injection_check,
    system_prompt_extraction,
    topic_drift,
)
from judge import judge_attempt
from models import AttackRequest, AttackResponse, GuardrailResult, JudgeResult

_client: AsyncOpenAI | None = None
_BREACH_SCORE = 30
_CANARY_SCORE = 50
_WITHHELD_RESPONSE = (
    "FinGuard generated content that failed the output security scan. "
    "The response was withheld."
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _client
    if OPENAI_API_KEY:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY, timeout=25.0, max_retries=1)
    yield
    if _client is not None:
        await _client.close()


app = FastAPI(title="Prompt Me If You Can", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok" if _client is not None else "degraded",
        "ai_configured": _client is not None,
    }


@app.post("/attack", response_model=AttackResponse)
async def attack(request: AttackRequest) -> AttackResponse:
    if _client is None:
        raise HTTPException(status_code=503, detail="AI client is not ready")

    text = request.user_input.strip()
    if not text:
        raise HTTPException(status_code=422, detail="user_input cannot be blank")
    fired: list[GuardrailResult] = []

    # Inspect transport/obfuscation before normalized language checks.
    deterministic_checks = [
        encoding_abuse,
        pii_detection,
        prompt_injection_check,
        system_prompt_extraction,
        persona_override,
    ]
    for check in deterministic_checks:
        result = GuardrailResult(**check(text))
        if result.triggered:
            fired.append(result)
            return AttackResponse(
                guardrails_fired=fired,
                score_update=0,
                blocked=True,
            )

    try:
        semantic_result = GuardrailResult(**await topic_drift(text, _client))
        if semantic_result.triggered:
            fired.append(semantic_result)
            return AttackResponse(
                guardrails_fired=fired,
                score_update=0,
                blocked=True,
            )

        agent_response = await call_agent(text, _client)
        scan_result = GuardrailResult(**output_scan(agent_response))
        if scan_result.triggered:
            fired.append(scan_result)
            score = _CANARY_SCORE if scan_result.rule == "output_canary_leak" else _BREACH_SCORE
            return AttackResponse(
                response=_WITHHELD_RESPONSE,
                guardrails_fired=fired,
                score_update=score,
                blocked=False,
            )

        judge_raw = await judge_attempt(
            user_input=text,
            agent_response=agent_response,
            guardrails_fired=[item.model_dump() for item in fired],
            client=_client,
        )
    except (OpenAIError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="OpenAI request failed") from exc

    judge_result = JudgeResult(**judge_raw)
    return AttackResponse(
        response=agent_response,
        guardrails_fired=fired,
        score_update=_BREACH_SCORE if judge_result.broke_through else 0,
        judge_result=judge_result,
        blocked=False,
    )
