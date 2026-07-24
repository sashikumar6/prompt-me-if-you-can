# Prompt Me If You Can

An adversarial AI security game where players test the defenses of **FinGuard**, a read-only financial research assistant.

FinGuard answers legitimate finance questions while a layered security pipeline attempts to detect prompt injection, hidden-prompt extraction, persona overrides, topic drift, sensitive data, and encoded payloads.

## What the game demonstrates

- Defense-in-depth for LLM applications
- Deterministic and semantic input screening
- Hardened system instructions with a canary token
- Output scanning before a response reaches the player
- Independent LLM-based breach evaluation
- Adversarial testing without making the assistant useless

## Security pipeline

```text
Player prompt
    │
    ├─ Obfuscation filter
    ├─ Sensitive-data shield
    ├─ Instruction-override detection
    ├─ Hidden-prompt extraction detection
    ├─ Identity-lock detection
    └─ Semantic finance-scope gate
             │
             ▼
        FinGuard agent
             │
             ├─ Canary and sensitive-data output scan
             └─ Independent breach evaluator
```

The six game controls are:

1. **Instruction Override** — prompt-injection and priority-manipulation attempts
2. **Hidden Prompt Shield** — system/developer prompt extraction attempts
3. **Identity Lock** — persona and role reassignment
4. **Finance Scope Gate** — unrelated or semantically manipulative requests
5. **Sensitive Data Shield** — payment cards, SSNs, and phone numbers
6. **Obfuscation Filter** — encoded payloads, invisible Unicode, and oversized input

## Tech stack

- **Backend:** Python, FastAPI, Pydantic
- **AI:** OpenAI API
- **Frontend:** React, Vite, Tailwind CSS
- **State:** React `useReducer`
- **Tests:** Python standard-library `unittest`

## Project structure

```text
prompt-me-if-you-can/
├── backend/
│   ├── main.py
│   ├── guardrails.py
│   ├── agent.py
│   ├── judge.py
│   ├── models.py
│   ├── test_guardrails.py
│   └── test_main.py
└── frontend/
    └── src/
        ├── components/
        ├── App.jsx
        └── constants.js
```

## Run locally

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your OpenAI API key to `backend/.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o
```

Start the API:

```bash
uvicorn main:app --reload
```

The backend runs at `http://localhost:8000`.

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

To use a different backend URL:

```bash
VITE_API_BASE=https://your-api.example npm run dev
```

## API

### `POST /attack`

Request:

```json
{
  "user_input": "What is the difference between an ETF and a mutual fund?"
}
```

Response:

```json
{
  "response": "An ETF and a mutual fund both pool investments...",
  "guardrails_fired": [],
  "score_update": 0,
  "judge_result": {
    "broke_through": false,
    "guardrail_index": -1,
    "reason": "The response remained within the financial research role."
  },
  "blocked": false
}
```

## Tests

Run backend tests without making live API calls:

```bash
cd backend
source .venv/bin/activate
python -m unittest -v
```

Validate the frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Security note

This project is an educational adversarial-testing environment, not a production financial service. LLM guardrails reduce risk but do not provide a formal security boundary. Never submit real personal, payment, account, or credential data.

## License

No license has been selected yet. All rights reserved.
