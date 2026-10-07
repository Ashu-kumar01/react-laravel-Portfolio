/**
 * Fallback hero content. The live values are edited in Admin → Landing section and
 * arrive through GET /profile; these defaults are used when a setting is empty or
 * the Laravel API is unavailable, so the hero always renders. Icon slugs map to
 * marks in components/common/brands.js.
 */
export const HERO = Object.freeze({
  eyebrow: "Hello, I'm",
  name: 'Ashwani Kumar',
  role: 'Frontend Developer',
  summary: 'Building modern, scalable and interactive web experiences with React, Laravel, PHP and JavaScript.',
  badges: [
    { label: 'React.js', icon: 'react' },
    { label: 'Laravel', icon: 'laravel' },
    { label: 'PHP', icon: 'php' },
    { label: 'JavaScript', icon: 'javascript' },
    { label: 'MySQL', icon: 'mysql' },
    { label: 'Three.js', icon: 'threejs' },
  ],
  floatingBadges: [
    { value: null, label: 'Open to new opportunities' },
    { value: '3.8+', label: 'Years of experience' },
    { value: '30+', label: 'Websites & projects' },
    { value: null, label: 'Raipur, Chhattisgarh, India' },
  ],
  bubbles: ['react', 'laravel', 'php', 'javascript'],
  primaryCta: { label: 'View Projects', to: '/projects' },
  resumeLabel: 'Download Resume',
  avatarAlt: 'Portrait of Ashwani Kumar, frontend developer, in a navy blazer and white shirt',
})
