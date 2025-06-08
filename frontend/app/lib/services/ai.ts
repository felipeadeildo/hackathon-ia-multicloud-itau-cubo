import { apiClient } from '../api'

export interface AIRecommendationResponse {
  result: string
}

export const aiService = {
  getRecommendation: async (deployId: number): Promise<AIRecommendationResponse> => {
    return apiClient.get<AIRecommendationResponse>(`/deployments/${deployId}/ai`)
  },
} 