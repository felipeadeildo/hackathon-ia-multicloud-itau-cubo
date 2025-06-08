import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Github,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { PROVIDER_NAMES } from '~/lib/constants/providers'
import type { Deploy } from '~/lib/types'
import {
  formatDate,
  getDeployStatus,
  getRepoName,
  getRepoOwner,
} from '~/lib/utils'

interface DeploymentCardProps {
  deployment: Deploy
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

const providerStatusColors = {
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  up: 'bg-green-50 text-green-700 border-green-200',
  down: 'bg-red-50 text-red-700 border-red-200',
} as const

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const status = getDeployStatus(deployment)
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-blue-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Github className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors">
                {getRepoName(deployment.github_repo_url)}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate">
                {getRepoOwner(deployment.github_repo_url)}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${config.color} flex items-center gap-1 px-2 py-1`}
          >
            <StatusIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Providers ({deployment.providers.length})
          </p>
          <div className="grid grid-cols-2 gap-1">
            {deployment.providers.map((provider) => (
              <Badge
                key={provider.id}
                variant="outline"
                className={`text-xs justify-center ${
                  providerStatusColors[provider.status]
                }`}
              >
                {PROVIDER_NAMES[provider.slug]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDate(deployment.created_at)}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/deploy/${deployment.id}`}>Ver Detalhes</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-9 h-9 p-0">
          <a
            href={deployment.github_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
