import { AlertCircle, CheckCircle, Github, Loader2, XCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useCreateDeployment } from '~/hooks'
import { AVAILABLE_PROVIDERS, PROVIDER_NAMES } from '~/lib/constants/providers'

interface NewDeployDialogProps {
  children: React.ReactNode
}

const providerStatusConfig = {
  up: {
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Disponível',
  },
  down: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Indisponível',
  },
  in_progress: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
    label: 'Processando',
  },
} as const

// Componente de simulação de IA
export function AIRecommendationSimulation() {
  const mockRecommendations = {
    aws: {
      latency: "45ms",
      availability: "99.99%",
      region: "São Paulo (sa-east-1)",
      recommendation: "Ideal para aplicações que exigem alta disponibilidade e baixa latência na América do Sul"
    },
    oracle: {
      latency: "52ms",
      availability: "99.95%",
      region: "São Paulo (sa-saopaulo-1)",
      recommendation: "Excelente para workloads corporativos com requisitos de segurança avançados"
    }
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Recomendações da IA</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(mockRecommendations).map(([provider, metrics]) => (
          <div key={provider} className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-800 mb-2 capitalize">{provider}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Latência:</span>
                <span className="ml-1 font-medium">{metrics.latency}</span>
              </div>
              <div>
                <span className="text-gray-600">Disponibilidade:</span>
                <span className="ml-1 font-medium">{metrics.availability}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Região:</span>
                <span className="ml-1 font-medium">{metrics.region}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-blue-700">{metrics.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NewDeployDialog({ children }: NewDeployDialogProps) {
  const [open, setOpen] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [urlError, setUrlError] = useState('')

  const createMutation = useCreateDeployment()

  const validateGithubUrl = (url: string) => {
    if (!url) {
      return 'URL do GitHub é obrigatória'
    }

    const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/
    if (!githubPattern.test(url)) {
      return 'URL deve ser um repositório GitHub válido (ex: https://github.com/user/repo)'
    }

    return ''
  }

  const handleProviderChange = (providerSlug: string, checked: boolean) => {
    if (checked) {
      setSelectedProviders((prev) => [...prev, providerSlug])
    } else {
      setSelectedProviders((prev) => prev.filter((p) => p !== providerSlug))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateGithubUrl(githubUrl)
    if (error) {
      setUrlError(error)
      return
    }

    if (selectedProviders.length === 0) {
      return
    }

    createMutation.mutate(
      {
        github_repo_url: githubUrl,
        providers: selectedProviders,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setGithubUrl('')
          setSelectedProviders([])
          setUrlError('')
        },
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setGithubUrl('')
      setSelectedProviders([])
      setUrlError('')
    }
  }

  const availableProviders = AVAILABLE_PROVIDERS.filter(p => p.status !== 'down')
  const unavailableProviders = AVAILABLE_PROVIDERS.filter(p => p.status === 'down')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Novo Deployment
          </DialogTitle>
          <DialogDescription>
            Selecione um repositório GitHub e os providers para deployment em múltiplas nuvens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="github-url" className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              URL do Repositório GitHub
            </Label>
            <Input
              id="github-url"
              type="url"
              placeholder="https://github.com/user/repository"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                if (urlError) setUrlError('')
              }}
              className={urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {urlError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {urlError}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Providers de Deploy</Label>
            
            {/* Available Providers */}
            {availableProviders.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Providers Disponíveis</p>
                <div className="space-y-2">
                  {availableProviders.map((provider) => {
                    const config = providerStatusConfig[provider.status]
                    const StatusIcon = config.icon
                    
                    return (
                      <div
                        key={provider.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`provider-${provider.id}`}
                          checked={selectedProviders.includes(provider.slug)}
                          onCheckedChange={(checked) =>
                            handleProviderChange(provider.slug, checked as boolean)
                          }
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <Label
                            htmlFor={`provider-${provider.id}`}
                            className="flex-1 cursor-pointer font-medium"
                          >
                            {PROVIDER_NAMES[provider.slug]}
                          </Label>
                          <Badge
                            variant="secondary"
                            className={`${config.color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Unavailable Providers */}
            {unavailableProviders.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Providers Indisponíveis</p>
                <div className="space-y-2">
                  {unavailableProviders.map((provider) => {
                    const config = providerStatusConfig[provider.status]
                    const StatusIcon = config.icon
                    
                    return (
                      <div
                        key={provider.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 opacity-60"
                      >
                        <Checkbox
                          id={`provider-${provider.id}`}
                          disabled
                          checked={false}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <Label
                            htmlFor={`provider-${provider.id}`}
                            className="flex-1 cursor-not-allowed font-medium text-muted-foreground"
                          >
                            {PROVIDER_NAMES[provider.slug]}
                          </Label>
                          <Badge
                            variant="secondary"
                            className={`${config.color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {selectedProviders.length === 0 && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Selecione pelo menos um provider
              </p>
            )}
          </div>

          {/* Adicionando a simulação de IA */}
          <AIRecommendationSimulation />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !githubUrl ||
                selectedProviders.length === 0 ||
                createMutation.isPending
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Deployment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}