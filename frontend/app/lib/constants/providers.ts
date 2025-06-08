import type { Provider } from '../types'

export const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 1,
    slug: 'aws',
    name: 'Amazon Web Services',
    provider_type: 'aws',
    status: 'up',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'oracle',
    name: 'Oracle Cloud',
    provider_type: 'oracle',
    status: 'up',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const getProviderBySlug = (slug: string): Provider | undefined => {
  return AVAILABLE_PROVIDERS.find(provider => provider.slug === slug)
}

export const getProviderById = (id: number): Provider | undefined => {
  return AVAILABLE_PROVIDERS.find(provider => provider.id === id)
}
