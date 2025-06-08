import { Plus, RefreshCw } from 'lucide-react'
import { DeploymentCard } from '~/components/DeploymentCard'
import { DeploymentStats } from '~/components/DeploymentStats'
import { NewDeployDialog } from '~/components/NewDeployDialog'
import { Button } from '~/components/ui/button'
import { useDeployments } from '~/hooks'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'MultiCloud Dashboard' },
    { name: 'description', content: 'Dashboard para deployments multi-cloud' },
  ]
}

export default function Home() {
  const { data: deployments = [], isLoading, error, refetch } = useDeployments()

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Erro ao carregar deployments
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              MultiCloud Dashboard
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus deployments em múltiplos provedores de nuvem
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <NewDeployDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Deploy
              </Button>
            </NewDeployDialog>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DeploymentStats deployments={deployments} />
        </div>

        {/* Deployments Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Deployments Recentes
              {isLoading && (
                <span className="ml-2 text-sm text-muted-foreground">
                  Atualizando...
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {deployments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <div className="mx-auto max-w-sm">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum deployment encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comece criando seu primeiro deployment para um repositório GitHub.
                </p>
                <NewDeployDialog>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Deploy
                  </Button>
                </NewDeployDialog>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deployments.map((deployment) => (
                <DeploymentCard key={deployment.id} deployment={deployment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
