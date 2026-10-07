import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { portfolioApi } from '../api/portfolio'
import { queryKeys } from '../api/queryClient'

/** Server-state hooks for the public site (TanStack Query handles caching/retry/refetch). */

export const useProfile = () =>
  useQuery({ queryKey: queryKeys.profile, queryFn: portfolioApi.profile, staleTime: 5 * 60_000 })

export const useProjects = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.projects(params),
    queryFn: () => portfolioApi.projects(params),
    placeholderData: keepPreviousData,
    ...options,
  })

export const useProject = (slug) =>
  useQuery({ queryKey: queryKeys.project(slug), queryFn: () => portfolioApi.project(slug), enabled: Boolean(slug) })

export const useTechnologies = () => useQuery({ queryKey: queryKeys.technologies, queryFn: portfolioApi.technologies })

export const useExperience = () => useQuery({ queryKey: queryKeys.experience, queryFn: portfolioApi.experience })

export const useServices = () => useQuery({ queryKey: queryKeys.services, queryFn: portfolioApi.services })

export const useApiHealth = () =>
  useQuery({
    queryKey: queryKeys.health,
    queryFn: portfolioApi.health,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 30_000,
  })
