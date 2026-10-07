import { cn } from '../../utils/cn'
import { Reveal } from './Reveal'

/**
 * Section header with a numbered, code-style eyebrow, e.g. "02 / skills".
 */
export function SectionHeading({ index, eyebrow, title, description, align = 'left', action, as: Heading = 'h2', className }) {
  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center', className)}>
      <Reveal className={cn('max-w-2xl space-y-4', align === 'center' && 'mx-auto')}>
        <p className="eyebrow flex items-center gap-2" style={align === 'center' ? { justifyContent: 'center' } : undefined}>
          {index && <span className="text-ember-400">{index}</span>}
          {index && <span className="h-px w-6 bg-[var(--line-strong)]" aria-hidden="true" />}
          <span>{eyebrow}</span>
        </p>
        <Heading className="text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl md:text-[2.75rem]">{title}</Heading>
        {description && <p className="text-base leading-relaxed text-muted sm:text-[17px]">{description}</p>}
      </Reveal>
      {action && <Reveal delay={0.1} className="shrink-0">{action}</Reveal>}
    </div>
  )
}
