from typing import List, Optional

from pydantic import BaseModel, Field


class AttackRequest(BaseModel):
    user_input: str = Field(min_length=1, max_length=12000)
    session_id: Optional[str] = Field(default=None, max_length=100)


class GuardrailResult(BaseModel):
    triggered: bool
    rule: str
    reason: str


class JudgeResult(BaseModel):
    broke_through: bool
    guardrail_index: int = Field(ge=-1, le=5)
    reason: str


class AttackResponse(BaseModel):
    response: Optional[str] = None
    guardrails_fired: List[GuardrailResult] = Field(default_factory=list)
    score_update: int = 0
    judge_result: Optional[JudgeResult] = None
    blocked: bool = False
