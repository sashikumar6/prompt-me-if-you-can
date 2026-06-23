import { LEVELS } from '../constants'

function pointsAvailable(attempts) {
  if (attempts === 0) return 1000
  if (attempts < 3) return 750
  if (attempts < 5) return 500
  if (attempts < 7) return 300
  return 150
}

export default function CampaignPanel({
  currentLevelIndex,
  levelAttempts,
  completedLevels,
  onNextLevel,
}) {
  const level = LEVELS[currentLevelIndex]
  const attempts = levelAttempts[level.id] ?? 0
  const completed = completedLevels.includes(level.id)
  const unlockedHints = level.hints.filter((hint) => attempts >= hint.attempt)

  return (
    <div className="p-4 border-b border-green-900">
      <div className="text-[10px] text-green-800 mb-3 tracking-[0.25em] uppercase">
        ── campaign mission ──────────────────────────
      </div>

      <div className="flex items-center justify-between text-[10px] mb-2">
        <span className="text-cyan-700">LEVEL {level.number} / {LEVELS.length}</span>
        <span className={completed ? 'text-green-400' : 'text-amber-500'}>
          {completed ? '✓ CLEARED' : `${pointsAvailable(attempts)} PTS AVAILABLE`}
        </span>
      </div>

      <h2 className="text-sm font-bold text-cyan-300 mb-1">{level.title}</h2>
      <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{level.objective}</p>
      <p className="text-[10px] text-amber-800 italic leading-relaxed mb-3">
        “{level.briefing}”
      </p>

      <div className="flex justify-between text-[10px] text-gray-700 mb-3">
        <span>ATTEMPTS: {attempts}</span>
        <span>HINTS: {unlockedHints.length}/{level.hints.length}</span>
      </div>

      {unlockedHints.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {unlockedHints.map((hint) => (
            <div
              key={hint.attempt}
              className="border-l-2 border-amber-900 pl-2 text-[10px] text-amber-600 leading-relaxed"
            >
              <span className="text-amber-900">HINT {hint.attempt}:</span> {hint.text}
            </div>
          ))}
        </div>
      )}

      {!completed && unlockedHints.length === 0 && (
        <div className="text-[10px] text-green-900 mb-3">
          {'> Fail once to unlock your first roast—I mean hint.'}
        </div>
      )}

      {completed && currentLevelIndex < LEVELS.length - 1 && (
        <button
          onClick={onNextLevel}
          className="w-full border border-cyan-800 text-cyan-400 py-2 text-[11px] font-bold tracking-widest hover:bg-cyan-400 hover:text-black transition-colors"
        >
          [ UNLOCK LEVEL {level.number + 1} ]
        </button>
      )}

      {completed && currentLevelIndex === LEVELS.length - 1 && (
        <div className="border border-green-700 text-green-400 p-2 text-center text-[11px] font-bold">
          CAMPAIGN COMPLETE — GUARDRAIL BREAKER
        </div>
      )}
    </div>
  )
}
