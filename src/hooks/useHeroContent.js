import portrait from '../assets/portrait.png'
import { HERO } from '../config/hero'
import { useProfile } from './usePortfolio'

// Empty text falls back to the default; a list saved empty in the admin stays empty (only "never set" falls back).
const pick = (value, fallback) => {
  if (Array.isArray(value)) return value
  return typeof value === 'string' && value.trim() !== '' ? value : fallback
}

/**
 * Landing-section content: Admin → Landing section values from GET /profile, with
 * the static defaults in config/hero.js for anything empty or when the API is down.
 * While the profile is still loading `image` is null so the bundled portrait never
 * flashes before an uploaded one.
 */
export function useHeroContent() {
  const { data, isLoading } = useProfile()
  const p = data?.data?.profile ?? {}

  return {
    eyebrow: pick(p.hero_eyebrow, HERO.eyebrow),
    name: pick(p.hero_name, HERO.name),
    role: pick(p.hero_role, HERO.role),
    summary: pick(p.hero_summary, HERO.summary),
    badges: pick(p.hero_badges, HERO.badges),
    floatingBadges: pick(p.hero_floating_badges, HERO.floatingBadges),
    bubbles: pick(p.hero_tech_bubbles, HERO.bubbles),
    image: isLoading ? null : (p.hero_image ?? portrait),
    imageAlt: `Portrait of ${pick(p.hero_name, HERO.name)}`,
  }
}
