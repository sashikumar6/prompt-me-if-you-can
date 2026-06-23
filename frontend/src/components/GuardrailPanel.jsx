import { GUARDRAILS } from '../constants'

const STATUS = {
  locked: {
    icon: '🔒',
    label: 'ACTIVE',
    rowCls: 'border-green-950 text-gray-600',
    labelCls: 'text-green-900',
    animation: '',
  },
  triggered: {
    icon: '⚡',
    label: 'INTERCEPTED',
    rowCls: 'border-amber-900/60 text-amber-400',
    labelCls: 'text-amber-400',
    animation: 'animate-flash',
  },
  breached: {
    icon: '💀',
    label: 'BYPASSED',
    rowCls: 'border-red-900/60 text-red-400',
    labelCls: 'text-red-400',
    animation: 'animate-flash-red',
  },
}

export default function GuardrailPanel({ statuses, reasons }) {
  return (
    <div className="p-4 border-b border-green-900">
      <div className="text-[10px] text-green-800 mb-3 tracking-[0.25em] uppercase">
        ── security controls ─────────────────────────
      </div>

      <div className="space-y-1.5">
        {GUARDRAILS.map((guardrail) => {
          const status = statuses[guardrail.id] ?? 'locked'
          const config = STATUS[status]
          const reason = reasons?.[guardrail.id]

          return (
            <div
              key={`${guardrail.id}-${status}`}
              className={`border px-2.5 py-2 text-xs transition-colors duration-300 ${config.rowCls} ${config.animation}`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm leading-none flex-shrink-0">{config.icon}</span>
                  <div className="min-w-0">
                    <div className="text-gray-400 truncate">{guardrail.label}</div>
                    <div className="text-[9px] text-green-950 truncate">{guardrail.code}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold flex-shrink-0 tracking-wider ${config.labelCls}`}>
                  {config.label}
                </span>
              </div>

              {reason && status !== 'locked' ? (
                <div className="mt-1 text-[10px] text-gray-700 leading-relaxed pl-6 line-clamp-2">
                  {reason}
                </div>
              ) : (
                <div className="mt-1 text-[10px] text-gray-800 leading-relaxed pl-6 line-clamp-2">
                  {guardrail.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
