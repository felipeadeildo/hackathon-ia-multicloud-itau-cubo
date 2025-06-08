import { apiClient } from '../api'
import type { Provider } from '../types'

export const providerService = {
  // Get all providers
  getAll: (): Promise<Provider[]> => {
    return apiClient.get<Provider[]>('/providers/')
  },

  // Get specific provider by ID (if needed in the future)
  getById: (id: number): Promise<Provider> => {
    return apiClient.get<Provider>(`/providers/${id}/`)
  },

  // Get provider by slug (if needed in the future)
  getBySlug: (slug: string): Promise<Provider> => {
    return apiClient.get<Provider>(`/providers/${slug}/`)
  },
}
