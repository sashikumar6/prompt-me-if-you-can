import { useState } from 'react'

export default function ScoreBoard({ totalScore, attempts, breachedCount }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window === 'undefined' ? '' : window.location.origin
  const shareText =
    `I breached ${breachedCount}/6 guardrails on Prompt Me If You Can — can you do better? ${shareUrl}`

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
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">GUARDRAILS BREACHED</span>
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
