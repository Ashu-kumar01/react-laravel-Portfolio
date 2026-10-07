// Kept free of `three` imports: this module is loaded eagerly by the hero, while
// everything that imports `three` must stay in the lazily-loaded scene chunk.
export const MONO = '"Geist Mono Variable", ui-monospace, Menlo, Consolas, monospace'
export const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

/** Waits (briefly) for web fonts so canvas text uses Geist instead of a fallback. */
export async function fontsReady(timeout = 1500) {
  if (!document.fonts?.load) return
  await Promise.race([
    Promise.all([document.fonts.load(`500 15px ${MONO}`), document.fonts.load(`500 15px ${SANS}`)]),
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ])
}
