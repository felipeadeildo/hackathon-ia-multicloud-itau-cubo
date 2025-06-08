import React, { useEffect, useState } from 'react'
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
  Loader2,
  Activity,
  Sparkles,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import { PROVIDER_NAMES } from '~/lib/constants/providers'
import type { LogLevel, Provider } from '~/lib/types'
import { useDeploymentPolling } from '~/hooks'
import {
  formatDate,
  formatDateWithSeconds,
  getDeployStatus,
  getRepoName,
  getRepoOwner,
} from '~/lib/utils'
import type { Route } from './+types/deploy-detail'
import { useConfetti } from '~/hooks/useConfetti'

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
  pending: {
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: Clock,
    label: 'Aguardando',
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
  success: {
    color: 'text-green-600',
    icon: CheckCircle,
    bg: 'bg-green-50',
  },
} as const

function ProviderLogs({ provider }: { provider: Provider }) {
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
          {provider.logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            provider.logs.map((log) => {
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

export default function DeployDetail() {
  const { id } = useParams();
  const { data: deployment } = useDeploymentPolling(Number(id));
  const deployStatus = deployment ? getDeployStatus(deployment) : 'pending';
  const currentStatusConfig = statusConfig[deployStatus];
  const StatusIcon = currentStatusConfig.icon;
  const hasCompleted = deployment?.progress === 100;

  // Adicionar o hook de confete
  useConfetti(hasCompleted);

  if (!deployment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    );
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
            <div className="flex items-start gap-3">
              <Github className="w-8 h-8 text-muted-foreground mt-1" />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {getRepoOwner(deployment.github_repo_url)} /
                  {getRepoName(deployment.github_repo_url)}
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Deploy ID: {deployment.id} • Criado em:
                  {formatDate(deployment.created_at)}
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${currentStatusConfig.color} flex items-center gap-1`}
          >
            <StatusIcon className="w-4 h-4" />
            {currentStatusConfig.label}
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Progress value={deployment.progress} className="flex-1" />
                  <span className="font-medium text-lg">
                    {deployment.progress}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Status:</Label>
                    <Badge
                      variant="outline"
                      className={`${currentStatusConfig.color} flex items-center gap-1 mt-1 w-fit`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {currentStatusConfig.label}
                    </Badge>
                  </div>
                  <div>
                    <Label>URL do Repositório:</Label>
                    <a
                      href={deployment.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                    >
                      {deployment.github_repo_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <Label>Criado em:</Label>
                    <p className="text-muted-foreground mt-1">
                      {formatDateWithSeconds(deployment.created_at)}
                    </p>
                  </div>
                  {deployment.updated_at && (
                    <div>
                      <Label>Última Atualização:</Label>
                      <p className="text-muted-foreground mt-1">
                        {formatDateWithSeconds(deployment.updated_at)}
                      </p>
                    </div>
                  )}
                  {deployment.completed_at && (
                    <div>
                      <Label>Concluído em:</Label>
                      <p className="text-muted-foreground mt-1">
                        {formatDateWithSeconds(deployment.completed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Provider Statuses & Logs */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Logs dos Providers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deployment.providers.map((provider) => (
                  <ProviderLogs key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
