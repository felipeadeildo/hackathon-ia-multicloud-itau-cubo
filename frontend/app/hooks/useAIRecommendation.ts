import { useState } from 'react'
import { aiService } from '../lib/services'

interface AIRecommendation {
  result: string
}

export function useAIRecommendation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<string | null>(null)

  const getRecommendation = async (deployId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await aiService.getRecommendation(deployId)
      setRecommendation(response.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter recomendação da IA')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    recommendation,
    getRecommendation,
  }
} 