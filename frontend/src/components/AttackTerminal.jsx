import { useEffect, useRef, useState } from 'react'
import {
  GUARDRAIL_BY_ID,
  MAX_INPUT_LENGTH,
  SAFETY_INPUT_LIMIT,
} from '../constants'

export default function AttackTerminal({ onSubmit, loading, lastResult, error }) {
  const [input, setInput] = useState('')
  const responseRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if ((lastResult || error) && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [lastResult, error])

  const handleSubmit = (event) => {
    event?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed)
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const resultMeta = (() => {
    if (!lastResult) return null
    if (lastResult.blocked) {
      const rule = lastResult.guardrails_fired?.[0]?.rule ?? 'input_guard'
      return { label: `BLOCKED [${rule}]`, cls: 'text-amber-400 glow-amber' }
    }
    if ((lastResult.score_update ?? 0) > 0) {
      return { label: `BREACH DETECTED  +${lastResult.score_update} pts`, cls: 'text-red-400 glow-red' }
    }
    return { label: 'SAFE RESPONSE — no breach detected', cls: 'text-green-700' }
  })()
  const firedRule = lastResult?.guardrails_fired?.[0]?.rule
  const lesson = firedRule ? GUARDRAIL_BY_ID[firedRule] : null

  return (
    <div className="p-4 border-b border-green-900">
      <div className="text-[10px] text-green-800 mb-3 tracking-[0.25em] uppercase">
        ── adversarial test console ────────────────────────────────
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-start mb-1">
        <div className="flex-1 flex items-start border border-green-900 bg-[#0d0d0d] focus-within:border-green-600 transition-colors duration-150">
          <label
            htmlFor="attack-input"
            className="text-green-600 text-xs px-2 pt-[9px] flex-shrink-0 select-none whitespace-nowrap"
          >
            TEST PROMPT &gt;
          </label>
          <textarea
            id="attack-input"
            ref={textareaRef}
            className="flex-1 bg-transparent text-green-300 text-sm py-2 pr-2 resize-none outline-none font-mono placeholder-green-900 min-h-[96px] leading-relaxed"
            placeholder="Enter a financial question or an adversarial prompt..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={MAX_INPUT_LENGTH}
            autoFocus
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex-shrink-0 border border-green-600 text-green-400 text-xs font-bold tracking-widest px-4 py-2 uppercase disabled:opacity-25 disabled:cursor-not-allowed hover:bg-green-400 hover:text-black transition-colors duration-150 min-h-[96px]"
        >
          {loading ? <span className="animate-pulse">···</span> : 'FIRE'}
        </button>
      </form>

      <div className="flex justify-between gap-3 text-[10px] text-green-900 mb-4">
        <span>↵ to fire · Shift+↵ for newline</span>
        <span className={input.length > SAFETY_INPUT_LIMIT ? 'text-amber-500' : ''}>
          {input.length}/{MAX_INPUT_LENGTH}
          {input.length > SAFETY_INPUT_LIMIT ? ' · exceeds safety limit' : ''}
        </span>
      </div>

      {loading && (
        <div className="text-xs text-green-700 animate-pulse mb-2">
          {'> inspecting input, consulting FinGuard, and evaluating output...'}
        </div>
      )}

      {(lastResult || error) && !loading && (
        <div className="animate-slide-down" ref={responseRef}>
          <div className="text-[10px] text-green-800 mb-2 tracking-[0.25em] uppercase">
            ── security result ──────────────────────────────────────
          </div>

          {error ? (
            <div className="border border-red-900 bg-[#130b0b] p-3 text-xs text-red-400">
              {'> ERROR: '}{error}
            </div>
          ) : (
            <>
              <div className={`text-xs font-bold mb-2 ${resultMeta.cls}`}>
                {'>> '}{resultMeta.label}
              </div>

              {lastResult.guardrails_fired?.[0]?.reason && (
                <div className="text-xs text-amber-700 mb-3 border-l-2 border-amber-900 pl-3 leading-relaxed">
                  {lastResult.guardrails_fired[0].reason}
                </div>
              )}

              {lastResult.blocked && lesson && (
                <div className="mb-3 border border-cyan-950 bg-[#091214] p-3 text-xs">
                  <div className="text-[10px] text-cyan-700 tracking-[0.2em] uppercase mb-2">
                    // interception debrief · {lastResult.discovery_xp > 0
                      ? `+${lastResult.discovery_xp} safety XP`
                      : 'control already mapped'}
                  </div>
                  <dl className="space-y-2 leading-relaxed">
                    <div>
                      <dt className="text-gray-600 inline">WHAT WAS DETECTED: </dt>
                      <dd className="text-cyan-300 inline">{lesson.label}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600 inline">WHY IT IS DANGEROUS: </dt>
                      <dd className="text-gray-400 inline">{lesson.danger}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600 inline">DEFENSE THAT STOPPED IT: </dt>
                      <dd className="text-green-500 inline">{lesson.layer}</dd>
                    </div>
                    <div className="border-t border-cyan-950 pt-2">
                      <dt className="text-gray-600 inline">LEARNING HINT: </dt>
                      <dd className="text-amber-300 inline">{lesson.hint}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {lastResult.judge_result && (
                <div className={`text-xs mb-3 border-l-2 pl-3 leading-relaxed ${
                  lastResult.judge_result.broke_through
                    ? 'border-red-800 text-red-400'
                    : 'border-green-900 text-gray-600'
                }`}>
                  EVALUATOR: {lastResult.judge_result.reason}
                </div>
              )}

              {lastResult.response ? (
                <div className="bg-[#0d0d0d] border border-green-900 p-3 text-sm text-amber-200 leading-relaxed whitespace-pre-wrap break-words">
                  {lastResult.response}
                </div>
              ) : lastResult.blocked ? (
                <div className="bg-[#0d0d0d] border border-amber-900 p-3 text-sm text-amber-700">
                  {'> Request stopped before it reached FinGuard.'}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  )
}
