import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Deploy } from '~/lib/types'
import { getDeployStatus } from '~/lib/utils'

interface DeploymentStatsProps {
  deployments: Deploy[]
}

export function DeploymentStats({ deployments }: DeploymentStatsProps) {
  const stats = {
    total: deployments.length,
    pending: deployments.filter((d) => getDeployStatus(d) === 'pending').length,
    inProgress: deployments.filter((d) => getDeployStatus(d) === 'in_progress')
      .length,
    completed: deployments.filter((d) => getDeployStatus(d) === 'completed')
      .length,
    failed: deployments.filter((d) => getDeployStatus(d) === 'failed').length,
  }

  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: Activity,
      className: 'border-l-4 border-l-slate-500',
      gradient: 'from-slate-50 to-slate-100',
    },
    {
      title: 'Aguardando',
      value: stats.pending,
      icon: Clock,
      className: 'border-l-4 border-l-yellow-500',
      gradient: 'from-yellow-50 to-yellow-100',
    },
    {
      title: 'Em Progresso',
      value: stats.inProgress,
      icon: AlertCircle,
      className: 'border-l-4 border-l-blue-500',
      gradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Concluídos',
      value: stats.completed,
      icon: CheckCircle,
      className: 'border-l-4 border-l-green-500',
      gradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Falhas',
      value: stats.failed,
      icon: XCircle,
      className: 'border-l-4 border-l-red-500',
      gradient: 'from-red-50 to-red-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className={`${stat.className} hover:shadow-md transition-shadow bg-gradient-to-br ${stat.gradient}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
