import {
  siBootstrap, siComposer, siCss, siDart, siExpress, siFigma, siFlutter, siGit, siGithub, siGooglechrome, siHtml5,
  siJavascript, siJquery, siLaravel, siMysql, siNodedotjs, siNpm, siPhp, siPostgresql, siPostman, siReact, siSass,
  siSublimetext, siTailwindcss, siThreedotjs, siVite,
} from 'simple-icons'

/** LinkedIn mark (not shipped by simple-icons v16 or lucide v1). */
const linkedin = {
  title: 'LinkedIn',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  hex: '0A66C2',
}

/** Technology slug (from the API or admin) → brand mark. The first slug per mark is the canonical one. */
export const BRANDS = {
  html5: siHtml5, css3: siCss, css: siCss, scss: siSass, sass: siSass, javascript: siJavascript, react: siReact,
  reactjs: siReact, bootstrap: siBootstrap, 'tailwind-css': siTailwindcss, jquery: siJquery, php: siPhp,
  laravel: siLaravel, nodejs: siNodedotjs, expressjs: siExpress, mysql: siMysql, postgresql: siPostgresql,
  flutter: siFlutter, dart: siDart, 'sublime-text': siSublimetext, npm: siNpm, composer: siComposer, vite: siVite, threejs: siThreedotjs, git: siGit, github: siGithub, postman: siPostman, figma: siFigma, 'chrome-devtools': siGooglechrome,
  linkedin,
}

/** Icon choices for admin pickers: one entry per distinct brand mark, sorted by name. */
export const BRAND_OPTIONS = Object.entries(BRANDS)
  .filter(([slug, icon], i, all) => slug !== 'linkedin' && all.findIndex(([, other]) => other === icon) === i)
  .map(([slug, icon]) => ({ slug, title: icon.title }))
  .sort((a, b) => a.title.localeCompare(b.title))
