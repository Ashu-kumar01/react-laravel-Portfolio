/**
 * Hero copy. Static on purpose: the hero (and its 3D avatar) must render even
 * when the Laravel API is unavailable. Badge slugs map to icons in BrandIcon.jsx.
 */
export const HERO = Object.freeze({
  eyebrow: "Hello, I'm",
  name: 'Ashwani Kumar',
  role: 'Frontend Developer',
  summary: 'Building modern, scalable and interactive web experiences with React, Laravel, PHP and JavaScript.',
  badges: [
    { label: 'React.js', slug: 'react' },
    { label: 'Laravel', slug: 'laravel' },
    { label: 'PHP', slug: 'php' },
    { label: 'JavaScript', slug: 'javascript' },
    { label: 'MySQL', slug: 'mysql' },
    { label: 'Three.js', slug: 'threejs' },
  ],
  primaryCta: { label: 'View Projects', to: '/projects' },
  resumeLabel: 'Download Resume',
  avatarAlt: 'Portrait of Ashwani Kumar, frontend developer, in a navy blazer and white shirt',
})
