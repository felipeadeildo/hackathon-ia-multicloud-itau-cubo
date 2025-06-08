import { apiClient } from '../api'
import type { Deploy, DeployCreateRequest } from '../types'

export const deploymentService = {
  // Get all deployments
  getAll: (): Promise<Deploy[]> => {
    return apiClient.get<Deploy[]>('/deployments/');
  },

  // Get specific deployment by ID
  getById: (id: number): Promise<Deploy> => {
    return apiClient.get<Deploy>(`/deployments/${id}/`);
  },

  // Create new deployment
  create: (data: DeployCreateRequest): Promise<Deploy> => {
    return apiClient.post<Deploy>('/deployments/', data);
  },

  // Update deployment (if needed in the future)
  update: (id: number, data: Partial<Deploy>): Promise<Deploy> => {
    return apiClient.patch<Deploy>(`/deployments/${id}/`, data);
  },

  // Delete deployment (if needed in the future)
  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/deployments/${id}/`);
  },
}
