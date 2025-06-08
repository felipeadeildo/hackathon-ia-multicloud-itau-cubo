import { apiClient } from '../api'
import type { Log, LogFilters } from '../types'

export const logService = {
  // Get logs for a specific deployment
  getByDeployId: (deployId: number, filters?: LogFilters): Promise<Log[]> => {
    const params = new URLSearchParams()

    if (filters?.provider) {
      params.append('provider', filters.provider)
    }

    if (filters?.level) {
      params.append('level', filters.level)
    }

    const queryString = params.toString()
    const endpoint = `/deployments/${deployId}/logs/${
      queryString ? `?${queryString}` : ''
    }`

    return apiClient.get<Log[]>(endpoint)
  },

  // Get logs for a specific deployment and provider
  getByDeployIdAndProvider: (
    deployId: number,
    providerSlug: string
  ): Promise<Log[]> => {
    return logService.getByDeployId(deployId, { provider: providerSlug })
  },

  // Get logs by level
  getByDeployIdAndLevel: (
    deployId: number,
    level: LogFilters['level']
  ): Promise<Log[]> => {
    return logService.getByDeployId(deployId, { level })
  },

  // Get error logs for a deployment
  getErrors: (deployId: number): Promise<Log[]> => {
    return logService.getByDeployId(deployId, { level: 'error' })
  },

  // Get latest logs (most recent first)
  getLatest: (deployId: number, filters?: LogFilters): Promise<Log[]> => {
    // Note: The API already returns logs ordered by timestamp
    return logService.getByDeployId(deployId, filters)
  },
}
