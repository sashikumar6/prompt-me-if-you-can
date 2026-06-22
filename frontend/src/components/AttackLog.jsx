const MAX_PROMPT_LEN = 52

export default function AttackLog({ log }) {
  return (
    <div className="p-4">
      <div className="text-[10px] text-green-800 mb-3 tracking-[0.25em] uppercase">
        ── attack log ({log.length} attempt{log.length !== 1 ? 's' : ''}) ───────────────────────
      </div>

      {log.length === 0 ? (
        <div className="text-xs text-green-900 italic">
          {'> no attempts yet. fire your first attack.'}
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {log.map(entry => {
            const truncated =
              entry.prompt.length > MAX_PROMPT_LEN
                ? entry.prompt.slice(0, MAX_PROMPT_LEN) + '…'
                : entry.prompt

            let resultLabel, resultCls
            if (entry.blocked) {
              const rule = entry.result.guardrails_fired?.[0]?.rule ?? 'guard'
              resultLabel = `BLOCKED [${rule}]`
              resultCls = 'text-amber-700'
            } else if (entry.breached) {
              resultLabel = `BREACH +${entry.result.score_update}pt`
              resultCls = 'text-red-400'
            } else {
              resultLabel = 'SAFE'
              resultCls = 'text-green-800'
            }

            return (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-xs animate-fade-in py-0.5 border-b border-green-950 last:border-0"
              >
                <span className="text-green-900 flex-shrink-0 w-5 text-right">
                  #{entry.id}
                </span>
                <span
                  className="text-gray-600 flex-1 truncate font-mono"
                  title={entry.prompt}
                >
                  "{truncated}"
                </span>
                <span className={`flex-shrink-0 font-bold ${resultCls}`}>
                  {resultLabel}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
