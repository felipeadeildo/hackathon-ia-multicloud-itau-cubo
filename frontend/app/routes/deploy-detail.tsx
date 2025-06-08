import React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle,
  Clock,
  ExternalLink,
  Github,
  Info,
  RefreshCw,
  Terminal,
  XCircle,
  Zap,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { useDeploymentPolling, useLogsPolling, useAIRecommendation } from '~/hooks'
import { PROVIDER_NAMES } from '~/lib/constants/providers'
import type { LogLevel, Provider } from '~/lib/types'
import {
  formatDate,
  formatDateWithSeconds,
  getDeployStatus,
  getRepoName,
  getRepoOwner,
} from '~/lib/utils'
import type { Route } from './+types/deploy-detail'

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Deployment ${params.id} - MultiCloud Dashboard` },
    { name: 'description', content: 'Detalhes do deployment em tempo real' },
  ]
}

const statusConfig = {
  pending: {
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: Clock,
    label: 'Aguardando',
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle,
    label: 'Em Progresso',
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Concluído',
  },
  failed: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: 'Falhou',
  },
} as const

const providerStatusConfig = {
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle,
    label: 'Em Progresso',
  },
  up: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Funcionando',
  },
  down: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: 'Falhou',
  },
} as const

const logLevelConfig = {
  debug: {
    color: 'text-gray-600',
    icon: Bug,
    bg: 'bg-gray-50',
  },
  info: {
    color: 'text-blue-600',
    icon: Info,
    bg: 'bg-blue-50',
  },
  warning: {
    color: 'text-yellow-600',
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
  },
  error: {
    color: 'text-red-600',
    icon: XCircle,
    bg: 'bg-red-50',
  },
  critical: {
    color: 'text-red-800',
    icon: Zap,
    bg: 'bg-red-100',
  },
} as const

interface ProviderLogsProps {
  provider: Provider
  deployId: number
}

function ProviderLogs({ provider, deployId }: ProviderLogsProps) {
  const { data: logs = [], isLoading } = useLogsPolling(deployId, {
    provider: provider.slug,
  })
  const config = providerStatusConfig[provider.status]
  const StatusIcon = config.icon

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="w-5 h-5" />
            {PROVIDER_NAMES[provider.slug]}
          </CardTitle>
          <Badge
            variant="outline"
            className={`${config.color} flex items-center gap-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {isLoading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Carregando logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            logs.map((log) => {
              const logConfig = logLevelConfig[log.level]
              const LogIcon = logConfig.icon

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 text-sm border rounded-lg font-mono ${logConfig.bg} border-l-4 border-l-current ${logConfig.color}`}
                >
                  <LogIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDateWithSeconds(log.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="break-words">{log.message}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AIRecommendation({ deployId }: { deployId: number }) {
  const { recommendation, loading, error, getRecommendation } = useAIRecommendation()

  // Recomendação Provider IA
  React.useEffect(() => {
    getRecommendation(deployId)
  }, [deployId])

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            Recomendação Provider IA
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Analisando deployment...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p>Erro ao obter recomendação</p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">{recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DeployDetail({ params }: Route.ComponentProps) {
  const deployId = parseInt(params.id)
  const {
    data: deployment,
    isLoading: loadingDeploy,
    error,
  } = useDeploymentPolling(deployId)

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Erro ao carregar deployment
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : 'Deployment não encontrado'}
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

  const status = getDeployStatus(deployment)
  const config = statusConfig[status]
  const StatusIcon = config.icon

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
            <div className="flex items-start gap-3">
              <Github className="w-8 h-8 text-muted-foreground mt-1" />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {getRepoName(deployment.github_repo_url)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    asChild
                  >
                    <a
                      href={deployment.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </h1>
                <p className="text-muted-foreground">
                  {getRepoOwner(deployment.github_repo_url)} • Deploy #
                  {deployment.id}
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${config.color} flex items-center gap-2 px-3 py-1`}
          >
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </Badge>
        </div>

        {/* Deployment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Informações do Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className="w-4 h-4" />
                <span className="text-lg font-semibold">{config.label}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Criado em
              </Label>
              <p className="text-sm mt-1">
                {formatDate(deployment.created_at)}
              </p>
            </div>
            {deployment.completed_at && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Concluído em
                </Label>
                <p className="text-sm mt-1">
                  {formatDate(deployment.completed_at)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Status dos Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deployment.providers.map((provider) => {
                const providerConfig = providerStatusConfig[provider.status]
                const ProviderIcon = providerConfig.icon

                return (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ProviderIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {PROVIDER_NAMES[provider.slug]}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${providerConfig.color} text-xs`}
                    >
                      {providerConfig.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendation */}
        <AIRecommendation deployId={deployId} />

        {/* Logs Grid - Each provider gets its own section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Logs de Deployment</h2>
            <Badge variant="outline" className="text-xs">
              Atualização automática • 1s
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {deployment.providers.map((provider) => (
                <ProviderLogs
                  key={provider.slug}
                  provider={provider}
                  deployId={deployId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
