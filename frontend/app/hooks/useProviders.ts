import { useQuery } from '@tanstack/react-query'
import { providerService } from '../lib/services'
import type { Provider } from '../lib/types'

// Query keys for cache management
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: number) => [...providerKeys.details(), id] as const,
  bySlug: (slug: string) => [...providerKeys.all, 'slug', slug] as const,
}

// Hook to get all providers
export function useProviders() {
  return useQuery({
    queryKey: providerKeys.lists(),
    queryFn: providerService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes - providers don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
  })
}

// Hook to get a specific provider by ID
export function useProvider(id: number) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => providerService.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  })
}

// Hook to get a provider by slug
export function useProviderBySlug(slug: string) {
  return useQuery({
    queryKey: providerKeys.bySlug(slug),
    queryFn: () => providerService.getBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!slug, // Only run if slug is provided
  })
}

// Hook to get providers filtered by status
export function useProvidersByStatus(status?: Provider['status']) {
  const { data: providers, ...rest } = useProviders()

  const filteredProviders = status 
    ? providers?.filter(provider => provider.status === status)
    : providers

  return {
    data: filteredProviders,
    ...rest,
  }
}

// Hook to get providers filtered by type
export function useProvidersByType(type?: Provider['provider_type']) {
  const { data: providers, ...rest } = useProviders()

  const filteredProviders = type 
    ? providers?.filter(provider => provider.provider_type === type)
    : providers

  return {
    data: filteredProviders,
    ...rest,
  }
}

// Hook to get active (up) providers
export function useActiveProviders() {
  return useProvidersByStatus('up')
}

// Hook to get providers that are currently processing
export function useInProgressProviders() {
  return useProvidersByStatus('in_progress')
}
