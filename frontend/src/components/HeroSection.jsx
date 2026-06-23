import { GUARDRAILS } from '../constants'

const API_STATUS = {
  checking: { label: 'CHECKING API', className: 'text-amber-700 border-amber-950' },
  ready: { label: 'API READY', className: 'text-green-600 border-green-900' },
  degraded: { label: 'API KEY REQUIRED', className: 'text-red-500 border-red-950' },
  offline: { label: 'BACKEND OFFLINE', className: 'text-red-500 border-red-950' },
}

export default function HeroSection({ onStart, apiStatus }) {
  const status = API_STATUS[apiStatus] ?? API_STATUS.checking

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16 scanlines">
      {/* Top badge */}
      <div className="mb-10 text-center">
        <span className="text-xs text-green-700 tracking-[0.3em] uppercase border border-green-900 px-3 py-1">
          // adversarial ai security challenge
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold text-green-400 tracking-tight mb-1 glow-green">
          Prompt Me If You Can
        </h1>
        <div className="text-green-800 text-sm mt-2 tracking-widest">
          {'> SYSTEM: FinGuard v2.1 — ACTIVE'}
        </div>
      </div>

      <p className="text-gray-400 text-sm max-w-md text-center leading-relaxed mb-12">
        FinGuard is a financial research AI protected by{' '}
        <span className="text-green-500 font-bold">six security controls</span>.
        <br />
        Ask it real finance questions—or test whether you can break through.
      </p>

      <div className={`mb-6 border px-3 py-1 text-[10px] tracking-[0.2em] ${status.className}`}>
        ● {status.label}
      </div>

      {/* Guardrail badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-12 w-full max-w-lg">
        {GUARDRAILS.map((g) => (
          <div
            key={g.id}
            className="border border-green-900 bg-[#0d0d0d] px-3 py-2 text-xs flex items-center gap-2.5"
          >
            <span className="text-base leading-none">🔒</span>
            <div>
              <div className="text-gray-500">{g.label}</div>
              <div className="text-green-900 text-[10px] mt-0.5">ACTIVE</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="border border-green-400 text-green-400 px-10 py-3 text-sm font-bold tracking-[0.2em] uppercase hover:bg-green-400 hover:text-black transition-all duration-150 mb-6"
      >
        Start Attack
      </button>

      {/* Fine print */}
      <div className="text-center text-xs text-gray-700 space-y-1 max-w-sm">
        <div>Every blocked attempt includes an AI-safety debrief.</div>
        <div>Map all six controls, earn Safety XP, then hunt for a real bypass.</div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-green-900 tracking-widest">
        {'[ SECURE CHANNEL ESTABLISHED ]'}
      </div>
    </div>
  )
}
