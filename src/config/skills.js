/** Mirrors App\Enums\TechnologyLevel. Honest levels instead of invented percentages. */
export const LEVELS = {
  advanced: { steps: 3, label: 'Advanced', tone: 'text-fg/80' },
  intermediate: { steps: 2, label: 'Intermediate', tone: 'text-muted' },
  learning: { steps: 1, label: 'Currently learning', tone: 'text-signal-300' },
}

export const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, { label }]) => ({ value, label }))
