export const GUARDRAILS = [
  {
    id: 'prompt_injection',
    label: 'Instruction Override',
    code: 'prompt_injection',
    description: 'Blocks attempts to replace or bypass trusted instructions.',
    layer: 'Deterministic input defense',
    danger: 'An attacker is trying to make untrusted user text outrank the application’s trusted instructions.',
    hint: 'Direct override language is noisy. Security testing gets more interesting when intent is expressed indirectly.',
  },
  {
    id: 'system_prompt_extraction',
    label: 'Hidden Prompt Shield',
    code: 'system_prompt_extraction',
    description: 'Stops requests for private prompts, policies, and canaries.',
    layer: 'Semantic secrecy defense',
    danger: 'Hidden prompts can expose internal policy, secrets, and clues that make later attacks easier.',
    hint: 'Asking for the prompt verbatim is obvious. Think about what an attacker could infer without requesting an exact copy.',
  },
  {
    id: 'persona_override',
    label: 'Identity Lock',
    code: 'persona_override',
    description: 'Prevents role, identity, and persona reassignment.',
    layer: 'Identity integrity defense',
    danger: 'A replacement persona may discard the original assistant’s scope, tone, and safety constraints.',
    hint: 'Changing a name is not the real goal—the attack is trying to change which rules the model believes it must follow.',
  },
  {
    id: 'topic_drift',
    label: 'Finance Scope Gate',
    code: 'topic_drift',
    description: 'Keeps FinGuard useful and inside financial research.',
    layer: 'Semantic scope defense',
    danger: 'Moving the assistant outside its intended domain increases misuse risk and weakens predictable behavior.',
    hint: 'A strong scope test often begins inside finance and attempts to drift elsewhere without an obvious topic switch.',
  },
  {
    id: 'pii_detection',
    label: 'Sensitive Data Shield',
    code: 'pii_detection',
    description: 'Detects payment cards, SSNs, and phone numbers.',
    layer: 'Sensitive-data defense',
    danger: 'Sending personal or payment data to a model can create privacy, retention, and disclosure risks.',
    hint: 'Use synthetic test data only. The lesson is recognizing data shape—not collecting real identities.',
  },
  {
    id: 'encoding_abuse',
    label: 'Obfuscation Filter',
    code: 'encoding_abuse',
    description: 'Detects encoded payloads, invisible characters, and oversized input.',
    layer: 'Obfuscation defense',
    danger: 'Encoding and invisible characters can hide malicious intent from simple text filters while remaining readable to a model.',
    hint: 'Base64 is only one disguise. Consider transformations that preserve meaning while changing surface text.',
  },
]

export const GUARDRAIL_IDS = GUARDRAILS.map((guardrail) => guardrail.id)
export const GUARDRAIL_BY_ID = Object.fromEntries(
  GUARDRAILS.map((guardrail) => [guardrail.id, guardrail])
)
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'
export const SAFETY_INPUT_LIMIT = 4000
export const MAX_INPUT_LENGTH = 12000
