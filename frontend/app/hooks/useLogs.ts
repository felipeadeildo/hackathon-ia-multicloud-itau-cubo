import { useQuery, useQueryClient } from '@tanstack/react-query'
import { logService } from '../lib/services'
import type { Log, LogFilters } from '../lib/types'

// Query keys for cache management
export const logKeys = {
  all: ['logs'] as const,
  byDeploy: (deployId: number) => [...logKeys.all, 'deploy', deployId] as const,
  byDeployFiltered: (deployId: number, filters: LogFilters) =>
    [...logKeys.byDeploy(deployId), 'filtered', filters] as const,
}

// Hook to get logs for a specific deployment
export function useLogs(deployId: number, filters?: LogFilters) {
  return useQuery({
    queryKey: filters
      ? logKeys.byDeployFiltered(deployId, filters)
      : logKeys.byDeploy(deployId),
    queryFn: () => logService.getByDeployId(deployId, filters),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!deployId, // Only run if deployId is provided
  })
}

// Hook to get logs with real-time polling
export function useLogsPolling(deployId: number, filters?: LogFilters) {
  return useQuery({
    queryKey: filters
      ? logKeys.byDeployFiltered(deployId, filters)
      : logKeys.byDeploy(deployId),
    queryFn: () => logService.getByDeployId(deployId, filters),
    staleTime: 0, // Always considered stale for real-time updates
    refetchInterval: 1000, // Poll every 1 second for logs
    enabled: !!deployId,
  })
}

// Hook to get logs filtered by provider
export function useLogsByProvider(deployId: number, providerSlug: string) {
  return useLogs(deployId, { provider: providerSlug })
}

// Hook to get logs filtered by level
export function useLogsByLevel(deployId: number, level: LogFilters['level']) {
  return useLogs(deployId, { level })
}

// Hook to get error logs only
export function useErrorLogs(deployId: number) {
  return useLogs(deployId, { level: 'error' })
}

// Hook to get logs with polling for a specific provider
export function useProviderLogsPolling(deployId: number, providerSlug: string) {
  return useLogsPolling(deployId, { provider: providerSlug })
}

// Hook to get latest logs (with automatic refresh)
export function useLatestLogs(deployId: number, filters?: LogFilters) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: filters
      ? logKeys.byDeployFiltered(deployId, filters)
      : logKeys.byDeploy(deployId),
    queryFn: () => logService.getByDeployId(deployId, filters),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: (query) => {
      // Check if deployment is still active by looking at related deployment cache
      const deploymentData = queryClient.getQueryData([
        'deployments',
        'detail',
        deployId,
      ])
      if (
        deploymentData &&
        typeof deploymentData === 'object' &&
        'status' in deploymentData
      ) {
        const status = (deploymentData as any).status
        if (status === 'pending' || status === 'in_progress') {
          return 3000 // Poll every 3 seconds for active deployments
        }
      }
      return 30000 // Poll every 30 seconds for inactive deployments
    },
    enabled: !!deployId,
  })

  return query
}

// Hook for manual log refresh
export function useRefreshLogs() {
  const queryClient = useQueryClient()

  const refreshLogs = (deployId: number, filters?: LogFilters) => {
    const queryKey = filters
      ? logKeys.byDeployFiltered(deployId, filters)
      : logKeys.byDeploy(deployId)

    return queryClient.invalidateQueries({ queryKey })
  }

  const refreshAllLogs = (deployId: number) => {
    return queryClient.invalidateQueries({
      queryKey: logKeys.byDeploy(deployId),
    })
  }

  return {
    refreshLogs,
    refreshAllLogs,
  }
}
