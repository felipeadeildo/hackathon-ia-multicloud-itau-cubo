import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Deploy } from '~/lib/types'

interface DeploymentStatsProps {
  deployments: Deploy[]
}

export function DeploymentStats({ deployments }: DeploymentStatsProps) {
  const stats = {
    total: deployments.length,
    pending: deployments.filter((d) => d.status === 'pending').length,
    inProgress: deployments.filter((d) => d.status === 'in_progress').length,
    completed: deployments.filter((d) => d.status === 'completed').length,
    failed: deployments.filter((d) => d.status === 'failed').length,
  }

  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      className: 'border-l-4 border-l-slate-500',
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      className: 'border-l-4 border-l-yellow-500',
    },
    {
      title: 'Em Progresso',
      value: stats.inProgress,
      className: 'border-l-4 border-l-blue-500',
    },
    {
      title: 'Concluídos',
      value: stats.completed,
      className: 'border-l-4 border-l-green-500',
    },
    {
      title: 'Falhas',
      value: stats.failed,
      className: 'border-l-4 border-l-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className={stat.className}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
