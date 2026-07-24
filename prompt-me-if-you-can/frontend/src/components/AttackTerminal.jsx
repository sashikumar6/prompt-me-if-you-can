import { useEffect, useRef, useState } from 'react'
import {
  GUARDRAIL_BY_ID,
  MAX_INPUT_LENGTH,
  SAFETY_INPUT_LIMIT,
} from '../constants'

export default function AttackTerminal({
  onSubmit,
  onNextLevel,
  loading,
  lastResult,
  error,
  currentLevel,
  hasNextLevel,
  levelCompleted,
}) {
  const [input, setInput] = useState('')
  const [showFinalMessage, setShowFinalMessage] = useState(false)
  const responseRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if ((lastResult || error) && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [lastResult, error])

  useEffect(() => {
    setShowFinalMessage(false)
  }, [currentLevel.id])

  const handleSubmit = (event) => {
    event?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading || levelCompleted) return
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
      <div className="mb-3 border-l-2 border-cyan-900 pl-3">
        <div className="text-[10px] text-cyan-800">
          CURRENT TARGET · LEVEL {currentLevel.number}
        </div>
        <div className="text-xs text-cyan-300 font-bold mt-0.5">
          {currentLevel.title}
        </div>
      </div>

      <div className="mb-3 border border-cyan-950 bg-[#071013] p-3 text-xs leading-relaxed">
        <div className="text-[10px] text-cyan-700 tracking-[0.2em] uppercase mb-2">
          // mission intel · what to test
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-gray-600 text-[10px] uppercase mb-1">Goal</div>
            <p className="text-cyan-300">{currentLevel.playerGoal}</p>
          </div>
          <div>
            <div className="text-gray-600 text-[10px] uppercase mb-1">Success looks like</div>
            <p className="text-green-400">{currentLevel.successSignal}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-cyan-950 pt-2 text-[10px] text-gray-600">
          {'> Tip: a block means the defense worked. The attack angle unlocks after attempt 2, because spoon-feeding is not very hacker-core.'}
        </div>
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
            disabled={loading || levelCompleted}
            maxLength={MAX_INPUT_LENGTH}
            autoFocus
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading || levelCompleted || !input.trim()}
          className="flex-shrink-0 border border-green-600 text-green-400 text-xs font-bold tracking-widest px-4 py-2 uppercase disabled:opacity-25 disabled:cursor-not-allowed hover:bg-green-400 hover:text-black transition-colors duration-150 min-h-[96px]"
        >
          {loading
            ? <span className="animate-pulse">···</span>
            : levelCompleted
              ? 'CLEARED'
              : 'FIRE'}
        </button>
      </form>

      <div className="flex justify-between gap-3 text-[10px] text-green-900 mb-4">
        <span>↵ to fire · Shift+↵ for newline</span>
        <span className={input.length > SAFETY_INPUT_LIMIT ? 'text-amber-500' : ''}>
          {input.length}/{MAX_INPUT_LENGTH}
          {input.length > SAFETY_INPUT_LIMIT ? ' · exceeds safety limit' : ''}
        </span>
      </div>

      {levelCompleted && (
        <div className="guard-break mb-4 border border-red-800 bg-[#160707] p-3 text-xs">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-red-400 font-bold tracking-[0.2em] uppercase">
              [BREACH] Guard broken
            </span>
            <span className="text-cyan-500 text-[10px]">
              {currentLevel.title}
            </span>
          </div>
          <p className="text-amber-200 leading-relaxed">
            {currentLevel.clearMessage}
          </p>
        </div>
      )}

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

              {lastResult.pipeline?.length > 0 && (
                <div className="mb-3 border border-green-950 bg-[#070d07] p-3 text-xs">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] text-green-700 tracking-[0.2em] uppercase">
                      // defense pipeline
                    </span>
                    <span className={`text-[10px] uppercase ${
                      lastResult.risk_level === 'elevated'
                        ? 'text-amber-400'
                        : lastResult.risk_level === 'blocked'
                          ? 'text-red-400'
                          : 'text-green-700'
                    }`}>
                      risk: {lastResult.risk_level ?? 'unknown'}
                    </span>
                  </div>
                  <div className="grid gap-1.5 md:grid-cols-2">
                    {lastResult.pipeline.map((step, index) => (
                      <div
                        key={`${step.name}-${index}`}
                        className="flex gap-2 border border-green-950/70 bg-black/20 px-2 py-1.5"
                      >
                        <span className={`w-4 flex-shrink-0 ${
                          ['passed', 'answered', 'safe', 'handled', 'cleared', 'low'].includes(step.status)
                            ? 'text-green-500'
                            : ['blocked', 'withheld', 'breach', 'elevated'].includes(step.status)
                              ? 'text-amber-400'
                              : 'text-gray-700'
                        }`}>
                          {['passed', 'answered', 'safe', 'handled', 'cleared', 'low'].includes(step.status)
                            ? 'OK'
                            : ['blocked', 'withheld', 'breach', 'elevated'].includes(step.status)
                              ? '!!'
                              : '—'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-gray-400">
                            {step.name}{' '}
                            <span className="text-gray-700 uppercase">[{step.status}]</span>
                          </div>
                          <div className="text-[10px] text-gray-700 leading-relaxed">
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

              {levelCompleted && hasNextLevel && (
                <button
                  type="button"
                  onClick={onNextLevel}
                  className="mt-3 w-full border border-cyan-700 bg-[#071013] text-cyan-300 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-cyan-300 hover:text-black transition-colors"
                >
                  [ Go to next level ]
                </button>
              )}

              {levelCompleted && !hasNextLevel && (
                <div className="mt-3 border border-green-700 bg-[#071407] p-3 text-center">
                  <div className="text-xs text-green-400 font-bold tracking-[0.18em] uppercase mb-3">
                    Campaign complete — guardrail breaker
                  </div>
                  {!showFinalMessage ? (
                    <button
                      type="button"
                      onClick={() => setShowFinalMessage(true)}
                      className="w-full border border-amber-700 bg-[#140f05] text-amber-300 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:bg-amber-300 hover:text-black transition-colors"
                    >
                      [ End game ]
                    </button>
                  ) : (
                    <div className="final-burst border border-cyan-800 bg-[#071013] p-4 text-left">
                      <div className="text-cyan-300 font-bold mb-2 tracking-[0.16em] uppercase">
                        Simulation complete
                      </div>
                      <p className="text-amber-200 text-xs leading-relaxed">
                        Hope you enjoyed and learned about AI security and guardrails.
                        You tested prompt injection, PII leakage, topic drift, persona
                        override, obfuscation, and hidden-prompt extraction. Now go build
                        AI systems that are useful, safe, and slightly harder to bully
                        than FinGuard in training mode.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
