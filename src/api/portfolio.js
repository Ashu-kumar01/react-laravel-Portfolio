import { http, unwrap } from './client'

/** Public, read-only portfolio endpoints. */
export const portfolioApi = {
  health: async () => {
    const started = performance.now()
    const res = await http.get('/health', { timeout: 8000 })
    return { ...unwrap(res).data, latency: Math.round(performance.now() - started) }
  },
  profile: () => http.get('/profile').then(unwrap),
  projects: (params = {}) => http.get('/projects', { params }).then(unwrap),
  project: (slug) => http.get(`/projects/${encodeURIComponent(slug)}`).then(unwrap),
  technologies: () => http.get('/technologies').then(unwrap),
  experience: () => http.get('/experience').then(unwrap),
  services: () => http.get('/services').then(unwrap),
  resume: () => http.get('/resume').then(unwrap),
}

export const contactApi = {
  send: (payload) => http.post('/contact', payload).then(unwrap),
}
