import type { Provider } from '../types'

export const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 1,
    slug: 'aws',
    status: 'up',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'oracle',
    status: 'up',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Helper para obter nomes amigáveis dos providers
export const PROVIDER_NAMES: Record<string, string> = {
  aws: 'Amazon Web Services',
  oracle: 'Oracle Cloud',
}

export const getProviderBySlug = (slug: string): Provider | undefined => {
  return AVAILABLE_PROVIDERS.find(provider => provider.slug === slug)
}

export const getProviderById = (id: number): Provider | undefined => {
  return AVAILABLE_PROVIDERS.find(provider => provider.id === id)
}
