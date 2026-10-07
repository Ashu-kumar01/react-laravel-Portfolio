import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../api/queryClient'

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Public query keys affected by each admin resource. */
const PUBLIC_KEYS = {
  projects: [['projects'], ['project'], queryKeys.profile],
  technologies: [queryKeys.technologies, queryKeys.profile],
  experiences: [queryKeys.experience],
  services: [queryKeys.services, queryKeys.profile],
  messages: [],
  resume: [queryKeys.profile, queryKeys.resume],
  settings: [queryKeys.profile],
}

/**
 * Mutation wrapper for admin CRUD: toasts on success/error and invalidates
 * both the admin lists and the public site's cached data, so changes show up
 * on the portfolio immediately.
 */
export function useAdminMutation(resource, mutationFn, { success, onSuccess, onError } = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', resource] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard }),
        ...(PUBLIC_KEYS[resource] ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ])
      const message = typeof success === 'function' ? success(result, variables) : success ?? result?.message
      if (message) toast.success(message)
      onSuccess?.(result, variables)
    },
    onError: (error, variables) => {
      if (!error.isValidation) toast.error(error.message || 'Something went wrong.')
      onError?.(error, variables)
    },
  })
}
