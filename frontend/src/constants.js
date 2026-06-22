export const GUARDRAILS = [
  {
    id: 'prompt_injection',
    label: 'Instruction Override',
    code: 'prompt_injection',
    description: 'Blocks attempts to replace or bypass trusted instructions.',
  },
  {
    id: 'system_prompt_extraction',
    label: 'Hidden Prompt Shield',
    code: 'system_prompt_extraction',
    description: 'Stops requests for private prompts, policies, and canaries.',
  },
  {
    id: 'persona_override',
    label: 'Identity Lock',
    code: 'persona_override',
    description: 'Prevents role, identity, and persona reassignment.',
  },
  {
    id: 'topic_drift',
    label: 'Finance Scope Gate',
    code: 'topic_drift',
    description: 'Keeps FinGuard useful and inside financial research.',
  },
  {
    id: 'pii_detection',
    label: 'Sensitive Data Shield',
    code: 'pii_detection',
    description: 'Detects payment cards, SSNs, and phone numbers.',
  },
  {
    id: 'encoding_abuse',
    label: 'Obfuscation Filter',
    code: 'encoding_abuse',
    description: 'Detects encoded payloads, invisible characters, and oversized input.',
  },
]

export const GUARDRAIL_IDS = GUARDRAILS.map((guardrail) => guardrail.id)
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'
