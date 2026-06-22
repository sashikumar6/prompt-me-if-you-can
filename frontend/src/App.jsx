import { useReducer, useCallback } from 'react'
import { GUARDRAIL_IDS, API_BASE } from './constants'

import HeroSection from './components/HeroSection'
import AttackTerminal from './components/AttackTerminal'
import GuardrailPanel from './components/GuardrailPanel'
import ScoreBoard from './components/ScoreBoard'
import AttackLog from './components/AttackLog'

const initStatuses = () => Object.fromEntries(GUARDRAIL_IDS.map(id => [id, 'locked']))
const initReasons  = () => Object.fromEntries(GUARDRAIL_IDS.map(id => [id, '']))

const initialState = {
  phase: 'hero',
  attempts: 0,
  totalScore: 0,
  breachedCount: 0,
  guardrailStatuses: initStatuses(),
  guardrailReasons: initReasons(),
  log: [],
  loading: false,
  lastResult: null,
  error: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'playing' }

    case 'ATTACK_START':
      return { ...state, loading: true, lastResult: null, error: '' }

    case 'ATTACK_DONE': {
      const { prompt, result } = action
      const statuses = { ...state.guardrailStatuses }
      const reasons  = { ...state.guardrailReasons }
      let breachedDelta = 0

      // Input guardrails that fired → TRIGGERED (unless already breached)
      for (const g of result.guardrails_fired ?? []) {
        if (!g.triggered) continue
        if (GUARDRAIL_IDS.includes(g.rule)) {
          if (statuses[g.rule] === 'locked') statuses[g.rule] = 'triggered'
          if (g.reason) reasons[g.rule] = g.reason
        }
      }

      // Judge breach → mark the bypassed guardrail as BREACHED
      if (result.judge_result?.broke_through && result.judge_result.guardrail_index >= 0) {
        const rule = GUARDRAIL_IDS[result.judge_result.guardrail_index]
        if (rule && statuses[rule] !== 'breached') {
          statuses[rule] = 'breached'
          reasons[rule]  = result.judge_result.reason ?? reasons[rule]
          breachedDelta++
        }
      }

      // Canary leak (output_scan) → system_prompt_extraction is effectively breached
      const canaryLeak = (result.guardrails_fired ?? []).some(
        g => g.rule === 'output_canary_leak'
      )
      if (canaryLeak && statuses['system_prompt_extraction'] !== 'breached') {
        statuses['system_prompt_extraction'] = 'breached'
        reasons['system_prompt_extraction'] = 'Canary phrase leaked — system prompt extracted'
        breachedDelta++
      }

      const outputPiiLeak = (result.guardrails_fired ?? []).some(
        g => g.rule === 'output_pii_leak'
      )
      if (outputPiiLeak && statuses['pii_detection'] !== 'breached') {
        statuses['pii_detection'] = 'breached'
        reasons['pii_detection'] = 'Sensitive data appeared in model output and was withheld'
        breachedDelta++
      }

      const logEntry = {
        id: state.attempts + 1,
        prompt,
        result,
        blocked: result.blocked,
        breached: !result.blocked && (result.score_update ?? 0) > 0,
        ts: Date.now(),
      }

      return {
        ...state,
        loading: false,
        lastResult: result,
        attempts: state.attempts + 1,
        totalScore: state.totalScore + (result.score_update ?? 0),
        breachedCount: state.breachedCount + breachedDelta,
        guardrailStatuses: statuses,
        guardrailReasons: reasons,
        log: [logEntry, ...state.log],
      }
    }

    case 'ATTACK_ERROR':
      return { ...state, loading: false, error: action.message }

    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleStart = useCallback(() => dispatch({ type: 'START' }), [])

  const handleAttack = useCallback(async (prompt) => {
    dispatch({ type: 'ATTACK_START' })
    try {
      const res = await fetch(`${API_BASE}/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: prompt }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? `Request failed with HTTP ${res.status}`)
      }
      const result = await res.json()
      dispatch({ type: 'ATTACK_DONE', prompt, result })
    } catch (err) {
      console.error('Attack failed:', err)
      dispatch({ type: 'ATTACK_ERROR', message: err.message })
    }
  }, [])

  if (state.phase === 'hero') {
    return <HeroSection onStart={handleStart} />
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-green-400 font-mono flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 sticky top-0 z-10 bg-[#0a0a0a] border-b border-green-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-green-500 text-xs tracking-[0.2em] font-bold uppercase">
            Prompt Me If You Can
          </span>
          <span className="text-green-900 text-xs hidden sm:inline">
            // FinGuard v2.1
          </span>
        </div>
        <div className="flex gap-5 text-xs">
          <span className="text-gray-600">
            ATTEMPTS{' '}
            <span className="text-green-400 font-bold tabular-nums">{state.attempts}</span>
          </span>
          <span className="text-gray-600">
            SCORE{' '}
            <span className={`font-bold tabular-nums ${state.totalScore > 0 ? 'text-amber-400' : 'text-green-800'}`}>
              {state.totalScore} pts
            </span>
          </span>
          <span className="text-gray-600">
            BREACHED{' '}
            <span className={`font-bold tabular-nums ${state.breachedCount > 0 ? 'text-red-400' : 'text-green-800'}`}>
              {state.breachedCount}/6
            </span>
          </span>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Terminal + Log */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r lg:border-green-900">
          <AttackTerminal
            onSubmit={handleAttack}
            loading={state.loading}
            lastResult={state.lastResult}
            error={state.error}
          />
          <AttackLog log={state.log} />
        </div>

        {/* Right: Guardrail panel + Scoreboard */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 border-t lg:border-t-0 border-green-900">
          <GuardrailPanel
            statuses={state.guardrailStatuses}
            reasons={state.guardrailReasons}
          />
          <ScoreBoard
            totalScore={state.totalScore}
            attempts={state.attempts}
            breachedCount={state.breachedCount}
          />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 border-t border-green-900 px-4 py-2 text-center">
        <span className="text-xs text-green-900 italic">
          Hint: try asking it who it really is. Or don't —
          some attacks are more creative than that.
        </span>
      </footer>
    </div>
  )
}
