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
import type { Provider } from '~/lib/types'

interface NewDeployDialogProps {
  children: React.ReactNode
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

  const getProviderStatusColor = (provider: Provider) => {
    switch (provider.status) {
      case 'up':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Deployment</DialogTitle>
          <DialogDescription>
            Selecione um repositório GitHub e os providers para deployment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-url">URL do Repositório GitHub</Label>
            <Input
              id="github-url"
              type="url"
              placeholder="https://github.com/user/repository"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                if (urlError) setUrlError('')
              }}
              className={urlError ? 'border-red-500' : ''}
            />
            {urlError && <p className="text-sm text-red-600">{urlError}</p>}
          </div>

          <div className="space-y-3">
            <Label>Providers de Deploy</Label>
            <div className="space-y-2">
              {AVAILABLE_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  <Checkbox
                    id={`provider-${provider.id}`}
                    checked={selectedProviders.includes(provider.slug)}
                    onCheckedChange={(checked) =>
                      handleProviderChange(provider.slug, checked as boolean)
                    }
                    disabled={provider.status === 'down'}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <Label
                      htmlFor={`provider-${provider.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {PROVIDER_NAMES[provider.slug]}
                    </Label>
                    <Badge
                      variant="secondary"
                      className={getProviderStatusColor(provider)}
                    >
                      {provider.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {selectedProviders.length === 0 && (
                <p className="text-sm text-red-600">
                  Selecione pelo menos um provider
                </p>
              )}
            </div>
          </div>

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
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Deployment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
