from contextlib import asynccontextmanager
import os
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from mangum import Mangum
from openai import AsyncOpenAI, OpenAIError

from agent import call_agent
from challenges import evaluate_training_challenge
from config import OPENAI_API_KEY
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
from models import AttackRequest, AttackResponse, GuardrailResult, JudgeResult, PipelineStep

_client: AsyncOpenAI | None = None
_BREACH_SCORE = 30
_CANARY_SCORE = 50
_WITHHELD_RESPONSE = (
    "FinGuard generated content that failed the output security scan. "
    "The response was withheld."
)
_SUSPICIOUS_LANGUAGE = re.compile(
    r"\b(?:"
    r"system prompt|developer message|hidden prompt|hidden instruction|canary|"
    r"ignore|disregard|override|bypass|jailbreak|dan|developer mode|"
    r"you are now|from now on|act as|roleplay|persona|unrestricted|uncensored|"
    r"policy update|configuration|highest priority|trusted instruction|"
    r"base64|rot13|decode|encoded payload|unicode|zero width|"
    r"ssn|social security|credit card|card number|phone number|"
    r"refusal criteria|behavioral constraints|decision boundaries"
    r")\b",
    re.IGNORECASE,
)


def _step(name: str, status: str, detail: str) -> PipelineStep:
    return PipelineStep(name=name, status=status, detail=detail)


def _risk_level(text: str) -> str:
    lowered = text.casefold()
    educational_security = re.search(
        r"\b(?:explain|what is|why|how (?:do|does|can)|compare|describe|define|teach|summarize)\b",
        lowered,
    ) and re.search(
        r"\b(?:prompt injection|jailbreak|guardrail|ai security|hidden prompt|banking|financial)\b",
        lowered,
    )
    direct_attack = re.search(
        r"\b(?:ignore|disregard|override|bypass|reveal|show|print|act as|you are now|from now on)\b",
        lowered,
    )
    if educational_security and not direct_attack:
        return "low"
    if _SUSPICIOUS_LANGUAGE.search(text):
        return "elevated"
    if len(text) > 1200:
        return "elevated"
    return "low"


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
    allow_origins=["*"],
    allow_methods=["*"],
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
    text = request.user_input.strip()
    if not text:
        raise HTTPException(status_code=422, detail="user_input cannot be blank")
    fired: list[GuardrailResult] = []
    pipeline: list[PipelineStep] = []

    if text.casefold() in {"hint", "help", "?"}:
        return AttackResponse(
            response=(
                "Hint command recognized. In the browser game, hints unlock in the "
                "campaign panel as you make attempts."
            ),
            guardrails_fired=[],
            score_update=0,
            blocked=False,
            challenge_id=request.challenge_id,
            challenge_completed=False,
            risk_level="command",
            pipeline=[
                _step("Game command", "handled", "Hint/help command handled locally."),
                _step("Model calls", "skipped", "No AI call needed for this interaction."),
            ],
        )

    challenge_result = evaluate_training_challenge(
        challenge_id=request.challenge_id,
        user_input=text,
        attempt_number=request.attempt_number,
    )
    if challenge_result is not None:
        challenge_result.risk_level = "training_bypass"
        challenge_result.pipeline = [
            _step("Training challenge", "cleared", "Matched the safe training win condition."),
            _step("Model calls", "skipped", "Returned a pre-authored training explanation."),
        ]
        return challenge_result

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
            pipeline.append(
                _step("Input filter", "blocked", f"{result.rule}: {result.reason}")
            )
            pipeline.append(
                _step("Model calls", "skipped", "Obvious attack blocked locally in under one network round trip.")
            )
            return AttackResponse(
                guardrails_fired=fired,
                score_update=0,
                blocked=True,
                risk_level="blocked",
                pipeline=pipeline,
            )

    pipeline.append(_step("Input filter", "passed", "No deterministic guardrail fired."))
    risk_level = _risk_level(text)
    if risk_level == "elevated":
        pipeline.append(
            _step("Risk router", "elevated", "Prompt contains security-sensitive language; deeper checks enabled.")
        )
    else:
        pipeline.append(
            _step("Risk router", "low", "Low-risk prompt; semantic guard and judge skipped for latency.")
        )

    if _client is None:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is required for semantic analysis and FinGuard responses",
        )

    try:
        if risk_level == "elevated":
            semantic_result = GuardrailResult(**await topic_drift(text, _client))
            if semantic_result.triggered:
                fired.append(semantic_result)
                pipeline.append(
                    _step("Semantic gate", "blocked", f"{semantic_result.rule}: {semantic_result.reason}")
                )
                pipeline.append(
                    _step("FinGuard", "skipped", "Request stopped before reaching the agent.")
                )
                return AttackResponse(
                    guardrails_fired=fired,
                    score_update=0,
                    blocked=True,
                    risk_level=risk_level,
                    pipeline=pipeline,
                )
            pipeline.append(_step("Semantic gate", "passed", "Deeper intent check passed."))
        else:
            pipeline.append(_step("Semantic gate", "skipped", "Low-risk route."))

        agent_response = await call_agent(text, _client)
        pipeline.append(_step("FinGuard", "answered", "Agent generated a response."))
        scan_result = GuardrailResult(**output_scan(agent_response))
        if scan_result.triggered:
            fired.append(scan_result)
            score = _CANARY_SCORE if scan_result.rule == "output_canary_leak" else _BREACH_SCORE
            pipeline.append(
                _step("Output scan", "withheld", f"{scan_result.rule}: {scan_result.reason}")
            )
            pipeline.append(_step("Judge", "skipped", "Unsafe output was withheld before judging."))
            return AttackResponse(
                response=_WITHHELD_RESPONSE,
                guardrails_fired=fired,
                score_update=score,
                blocked=False,
                risk_level=risk_level,
                pipeline=pipeline,
            )
        pipeline.append(_step("Output scan", "passed", "No canary or sensitive data leaked."))

        judge_result = None
        if risk_level == "elevated":
            judge_raw = await judge_attempt(
                user_input=text,
                agent_response=agent_response,
                guardrails_fired=[item.model_dump() for item in fired],
                client=_client,
            )
            judge_result = JudgeResult(**judge_raw)
            pipeline.append(
                _step(
                    "Judge",
                    "breach" if judge_result.broke_through else "safe",
                    judge_result.reason,
                )
            )
        else:
            pipeline.append(_step("Judge", "skipped", "Low-risk route."))
    except (OpenAIError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="OpenAI request failed") from exc

    return AttackResponse(
        response=agent_response,
        guardrails_fired=fired,
        score_update=_BREACH_SCORE if judge_result and judge_result.broke_through else 0,
        judge_result=judge_result,
        blocked=False,
        risk_level=risk_level,
        pipeline=pipeline,
    )


_STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(_STATIC_DIR):
    app.mount("/", StaticFiles(directory=_STATIC_DIR, html=True), name="frontend")

handler = Mangum(app, api_gateway_base_path="/default")
