import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useDeploymentPolling, useLatestLogs } from '~/hooks'
import { AVAILABLE_PROVIDERS, PROVIDER_NAMES } from '~/lib/constants/providers'
import type { LogLevel } from '~/lib/types'
import type { Route } from './+types/deploy-detail'

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Deployment ${params.id} - MultiCloud Dashboard` },
    { name: 'description', content: 'Detalhes do deployment em tempo real' },
  ]
}

const providerStatusColors = {
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  up: 'bg-green-100 text-green-800 border-green-200',
  down: 'bg-red-100 text-red-800 border-red-200',
} as const

const providerStatusLabels = {
  in_progress: 'Em Progresso',
  up: 'Funcionando',
  down: 'Fora do Ar',
} as const

const logLevelColors = {
  debug: 'text-gray-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  critical: 'text-red-800 font-bold',
} as const

export default function DeployDetail({ params }: Route.ComponentProps) {
  const deployId = parseInt(params.id)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | ''>('')

  const { data: deployment, isLoading: loadingDeploy, error } = useDeploymentPolling(deployId)
  const { data: logs = [], isLoading: loadingLogs, refetch: refetchLogs } = useLatestLogs(
    deployId,
    {
      ...(selectedProvider && { provider: selectedProvider }),
      ...(selectedLevel && { level: selectedLevel }),
    }
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getRepoName = (url: string) => {
    try {
      const parts = url.split('/')
      return parts[parts.length - 1] || url
    } catch {
      return url
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Erro ao carregar deployment
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Deployment não encontrado'}
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loadingDeploy || !deployment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando deployment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {getRepoName(deployment.github_repo_url)}
              </h1>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {deployment.github_repo_url}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            {deployment.completed_at ? 'Concluído' : 'Em Andamento'}
          </Badge>
        </div>

        {/* Deployment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Deployment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <p className="text-lg font-semibold">
                {deployment.completed_at ? 'Concluído' : 'Em Andamento'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Criado em
              </Label>
              <p className="text-sm">{formatDate(deployment.created_at)}</p>
            </div>
            {deployment.completed_at && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Concluído em
                </Label>
                <p className="text-sm">{formatDate(deployment.completed_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deployment.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{PROVIDER_NAMES[provider.slug]}</span>
                  <Badge variant="outline" className="text-xs">
                    {provider.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Logs de Deployment</CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchLogs()}
                  disabled={loadingLogs}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingLogs ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="provider-filter" className="text-sm">
                  Filtrar por Provider
                </Label>
                <Select 
                  value={selectedProvider || 'all-providers'} 
                  onValueChange={(value) => setSelectedProvider(value === 'all-providers' ? '' : value)}
                >
                  <SelectTrigger id="provider-filter">
                    <SelectValue placeholder="Todos os providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-providers">Todos os providers</SelectItem>
                    {AVAILABLE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.slug}>
                        {PROVIDER_NAMES[provider.slug]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="level-filter" className="text-sm">
                  Filtrar por Nível
                </Label>
                <Select 
                  value={selectedLevel || 'all-levels'} 
                  onValueChange={(value) => setSelectedLevel(value === 'all-levels' ? '' : value as LogLevel)}
                >
                  <SelectTrigger id="level-filter">
                    <SelectValue placeholder="Todos os níveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-levels">Todos os níveis</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loadingLogs ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Carregando logs...
                  </div>
                ) : (
                  'Nenhum log encontrado'
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 text-sm border rounded-lg font-mono"
                  >
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {PROVIDER_NAMES[log.provider.slug]}
                    </Badge>
                    <span className={`font-medium ${logLevelColors[log.level]}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
