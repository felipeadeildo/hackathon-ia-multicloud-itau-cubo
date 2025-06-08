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
import type { Deploy } from '~/lib/types'

interface DeploymentCardProps {
  deployment: Deploy
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
} as const

const statusLabels = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  failed: 'Falhou',
} as const

export function DeploymentCard({ deployment }: DeploymentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium truncate">
            {getRepoName(deployment.github_repo_url)}
          </CardTitle>
          <Badge
            variant="secondary"
            className={statusColors[deployment.status]}
          >
            {statusLabels[deployment.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {deployment.github_repo_url}
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Providers:
            </p>
            <div className="flex flex-wrap gap-1">
              {deployment.providers.map((provider) => (
                <Badge key={provider.id} variant="outline" className="text-xs">
                  {provider.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Criado: {formatDate(deployment.created_at)}</p>
            {deployment.completed_at && (
              <p>Concluído: {formatDate(deployment.completed_at)}</p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/deploy/${deployment.id}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
