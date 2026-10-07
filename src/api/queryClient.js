import { QueryClient } from '@tanstack/react-query'

const noRetryKinds = new Set(['validation', 'auth', 'forbidden', 'not_found', 'rate_limit'])

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      // Refetch on focus so content edited in the admin panel shows up without a reload.
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => !noRetryKinds.has(error?.kind) && failureCount < 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 6000),
    },
    mutations: { retry: false },
  },
})

/** Query keys in one place so admin mutations can invalidate public data too. */
export const queryKeys = {
  health: ['health'],
  profile: ['profile'],
  projects: (params = {}) => ['projects', params],
  project: (slug) => ['project', slug],
  technologies: ['technologies'],
  experience: ['experience'],
  services: ['services'],
  resume: ['resume'],
  admin: {
    all: ['admin'],
    dashboard: ['admin', 'dashboard'],
    list: (resource, params = {}) => ['admin', resource, 'list', params],
    item: (resource, id) => ['admin', resource, 'item', String(id)],
    resume: ['admin', 'resume'],
    settings: ['admin', 'settings'],
  },
}
