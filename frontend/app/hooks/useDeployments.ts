import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deploymentService } from '../lib/services'
import type { Deploy, DeployCreateRequest } from '../lib/types'

// Query keys for cache management
export const deploymentKeys = {
  all: ['deployments'] as const,
  lists: () => [...deploymentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...deploymentKeys.lists(), { filters }] as const,
  details: () => [...deploymentKeys.all, 'detail'] as const,
  detail: (id: number) => [...deploymentKeys.details(), id] as const,
}

// Hook to get all deployments
export function useDeployments() {
  return useQuery({
    queryKey: deploymentKeys.lists(),
    queryFn: deploymentService.getAll,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: (query) => {
      // Auto-refetch if any deployment is in progress
      const data = query.state.data
      const hasActiveDeployment = data?.some(
        (deploy: Deploy) =>
          deploy.status === 'pending' || deploy.status === 'in_progress'
      )
      return hasActiveDeployment ? 3000 : false // 3 seconds if active, otherwise no auto-refetch
    },
  })
}

// Hook to get a specific deployment
export function useDeployment(id: number) {
  return useQuery({
    queryKey: deploymentKeys.detail(id),
    queryFn: () => deploymentService.getById(id),
    staleTime: 10 * 1000, // 10 seconds
    enabled: !!id, // Only run if id is provided
  })
}

// Hook to get a deployment with polling (for real-time updates)
export function useDeploymentPolling(id: number) {
  return useQuery({
    queryKey: deploymentKeys.detail(id),
    queryFn: () => deploymentService.getById(id),
    staleTime: 0, // Always considered stale for real-time updates
    refetchInterval: (query) => {
      // Poll every 3 seconds if deployment is active
      const data = query.state.data
      if (data?.status === 'pending' || data?.status === 'in_progress') {
        return 3000
      }
      // Poll every 10 seconds if completed/failed (in case status changes)
      return 10000
    },
    enabled: !!id,
  })
}

// Hook to create a new deployment
export function useCreateDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DeployCreateRequest) => deploymentService.create(data),
    onSuccess: (newDeployment) => {
      // Invalidate and refetch deployments list
      queryClient.invalidateQueries({ queryKey: deploymentKeys.lists() })

      // Add the new deployment to cache
      queryClient.setQueryData(
        deploymentKeys.detail(newDeployment.id),
        newDeployment
      )
    },
  })
}

// Hook to update deployment (for future use)
export function useUpdateDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Deploy> }) =>
      deploymentService.update(id, data),
    onSuccess: (updatedDeployment) => {
      // Update the deployment in cache
      queryClient.setQueryData(
        deploymentKeys.detail(updatedDeployment.id),
        updatedDeployment
      )

      // Invalidate deployments list to refetch
      queryClient.invalidateQueries({ queryKey: deploymentKeys.lists() })
    },
  })
}

// Hook to delete deployment (for future use)
export function useDeleteDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deploymentService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove deployment from cache
      queryClient.removeQueries({ queryKey: deploymentKeys.detail(deletedId) })

      // Invalidate deployments list
      queryClient.invalidateQueries({ queryKey: deploymentKeys.lists() })
    },
  })
}
