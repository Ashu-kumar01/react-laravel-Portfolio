const trimSlash = (value) => (value || '').replace(/\/+$/, '')

/** Runtime configuration sourced only from Vite env variables (see .env.example). */
export const env = Object.freeze({
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL),
  siteUrl: trimSlash(import.meta.env.VITE_SITE_URL) || (typeof window !== 'undefined' ? window.location.origin : ''),
  isDev: import.meta.env.DEV,
})

if (!env.apiBaseUrl && import.meta.env.MODE !== 'test') {
  console.error('VITE_API_BASE_URL is not configured. Copy .env.example to .env and set it.')
}
