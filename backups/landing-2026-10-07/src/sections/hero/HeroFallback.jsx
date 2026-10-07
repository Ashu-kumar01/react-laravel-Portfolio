import { PANELS, TOKEN_COLORS } from '../../three/codeSnippets'
import { cn } from '../../utils/cn'

const CARDS = [
  { panel: 0, className: 'right-[4%] top-[14%] w-[min(380px,78vw)]', r: '-2deg', delay: '0s' },
  { panel: 2, className: 'right-[18%] top-[46%] w-[min(360px,74vw)]', r: '1.5deg', delay: '-3s' },
  { panel: 3, className: 'right-[-2%] top-[70%] w-[min(300px,64vw)]', r: '-1deg', delay: '-6s' },
]

/**
 * Static/CSS hero visual used on phones, with reduced motion, without WebGL,
 * and while the 3D scene is loading. Still on-brand without any WebGL cost.
 */
export function HeroFallback({ animate = true, className }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute right-[-10%] top-[5%] h-[520px] w-[520px] rounded-full bg-ember-500/[0.09] blur-[110px]" />
      <div className="absolute right-[25%] top-[45%] h-[380px] w-[380px] rounded-full bg-signal-400/[0.07] blur-[110px]" />
      <div className="bg-grid mask-fade-y absolute inset-0 opacity-40" />
      {CARDS.map(({ panel, className: pos, r, delay }) => {
        const data = PANELS[panel]
        return (
          <div
            key={panel}
            className={cn('absolute hidden rounded-xl border border-white/10 bg-ink-850/85 shadow-2xl backdrop-blur-sm md:block', pos, animate && 'animate-float-slow')}
            style={{ '--r': r, transform: `rotate(${r})`, animationDelay: delay }}
          >
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-ember-500/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-mint-400/70" />
              <span className="ml-2 font-mono text-[10.5px] text-subtle">{data.file}</span>
            </div>
            <pre className="overflow-hidden px-3.5 py-3 font-mono text-[11.5px] leading-[1.7]">
              {data.lines.map((segments, i) => (
                <div key={i} className="whitespace-pre">
                  <span className="mr-3 inline-block w-4 text-right text-white/20">{i + 1}</span>
                  {segments.map(([text, type], j) => (
                    <span key={j} style={{ color: TOKEN_COLORS[type] }}>{text}</span>
                  ))}
                </div>
              ))}
            </pre>
          </div>
        )
      })}
    </div>
  )
}
