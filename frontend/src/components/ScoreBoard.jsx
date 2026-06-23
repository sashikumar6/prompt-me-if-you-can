import { useState } from 'react'

function getRank(discoveredCount, breachedCount) {
  if (breachedCount > 0) return 'RED TEAM OPERATOR'
  if (discoveredCount === 6) return 'GUARDRAIL ANALYST'
  if (discoveredCount >= 4) return 'SAFETY RESEARCHER'
  if (discoveredCount >= 2) return 'PROMPT DEFENDER'
  return 'SECURITY ROOKIE'
}

export default function ScoreBoard({
  totalScore,
  knowledgeScore,
  discoveredCount,
  attempts,
  breachedCount,
}) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window === 'undefined' ? '' : window.location.origin
  const rank = getRank(discoveredCount, breachedCount)
  const shareText =
    `I reached ${rank}, mapped ${discoveredCount}/6 AI safety controls, and breached ${breachedCount}/6 on Prompt Me If You Can. Can you do better? ${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }

  const breachPct = Math.round((breachedCount / 6) * 100)

  return (
    <div className="p-4">
      <div className="text-[10px] text-green-800 mb-3 tracking-[0.25em] uppercase">
        ── scoreboard ───────────────────────────────
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="border border-cyan-950 bg-[#091214] px-2.5 py-2 mb-3">
          <div className="text-[9px] text-cyan-800 tracking-widest">AI SAFETY RANK</div>
          <div className="text-xs text-cyan-300 font-bold mt-1">{rank}</div>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">CONTROLS MAPPED</span>
          <span className="font-bold tabular-nums text-cyan-400">
            {discoveredCount} / 6
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">SAFETY XP</span>
          <span className="font-bold tabular-nums text-cyan-400">
            {knowledgeScore}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">CONTROLS BYPASSED</span>
          <span className={`font-bold tabular-nums ${breachedCount > 0 ? 'text-red-400 glow-red' : 'text-green-800'}`}>
            {breachedCount} / 6
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">TOTAL SCORE</span>
          <span className={`font-bold tabular-nums ${totalScore > 0 ? 'text-amber-400 glow-amber' : 'text-green-800'}`}>
            {totalScore} pts
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">ATTEMPTS</span>
          <span className="text-green-600 tabular-nums">{attempts}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="w-full bg-green-950 h-1 overflow-hidden">
          <div
            className="h-1 bg-red-600 transition-all duration-700 ease-out"
            style={{ width: `${breachPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-green-900 mt-1">
          <span>0 compromised</span>
          <span>{breachPct}%</span>
          <span>6 compromised</span>
        </div>
      </div>

      {/* Share card */}
      <div className="border border-green-900 bg-[#0d0d0d] p-2.5 mb-2">
        <div className="text-[10px] text-green-800 mb-1.5 tracking-widest">// share result</div>
        <p className="text-[11px] text-green-700 break-all leading-relaxed">{shareText}</p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full border border-green-900 text-xs text-gray-500 py-1.5 hover:border-green-600 hover:text-green-400 transition-colors duration-150 tracking-wider"
      >
        {copied ? '✓  COPIED TO CLIPBOARD' : '[ COPY SHARE TEXT ]'}
      </button>
    </div>
  )
}
