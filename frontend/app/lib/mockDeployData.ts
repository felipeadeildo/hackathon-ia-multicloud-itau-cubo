import type { Deploy, DeployCreateRequest, Provider } from './types';

interface CreateDeploymentOptions {
  id: number;
  github_repo_url: string;
  providers: string[];
}

// Função auxiliar para carregar deployments do localStorage
const loadDeploymentsFromLocalStorage = (): Deploy[] => {
  try {
    const storedDeployments = localStorage.getItem('mockDeployments');
    return storedDeployments ? JSON.parse(storedDeployments) : [];
  } catch (error) {
    console.error("Erro ao carregar deployments do localStorage:", error);
    return [];
  }
};

// Função auxiliar para salvar deployments no localStorage
const saveDeploymentsToLocalStorage = (deployments: Deploy[]) => {
  try {
    localStorage.setItem('mockDeployments', JSON.stringify(deployments));
  } catch (error) {
    console.error("Erro ao salvar deployments no localStorage:", error);
  }
};

export const createMockDeployment = ({ id, github_repo_url, providers: providerSlugs }: CreateDeploymentOptions): Deploy => ({
  id,
  github_repo_url,
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  progress: 0,
  providers: providerSlugs.map(slug => ({
    slug,
    status: 'pending',
    logs: [],
    id: Math.floor(Math.random() * 1000000), // Generate a random ID for provider
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
});

export const mockDeployments: Deploy[] = loadDeploymentsFromLocalStorage();

export const addMockDeployment = (data: DeployCreateRequest): Deploy => {
  const newId = mockDeployments.length > 0 ? Math.max(...mockDeployments.map(d => d.id)) + 1 : 1;
  const newDeployment = createMockDeployment({ id: newId, ...data });
  mockDeployments.push(newDeployment);
  saveDeploymentsToLocalStorage(mockDeployments); // Salvar após adicionar
  return newDeployment;
};

export const getMockDeploymentById = (id: number): Deploy | undefined => {
  return mockDeployments.find(d => d.id === id);
};

export const simulateDeploymentProgress = (
  deployId: number,
  onProgress: (deployment: Deploy) => void
) => {
  let progress = getMockDeploymentById(deployId)?.progress || 0;
  let lastLogTime = Date.now();
  const LOG_INTERVAL = 800; // Intervalo mínimo entre logs em ms

  const interval = setInterval(() => {
    const deployment = getMockDeploymentById(deployId);
    if (!deployment) {
      clearInterval(interval);
      return;
    }

    progress += 5;
    if (progress > 100) progress = 100;

    const currentTime = Date.now();
    const shouldAddLog = currentTime - lastLogTime >= LOG_INTERVAL;

    const updatedDeployment: Deploy = {
      ...deployment,
      progress,
      status: progress >= 100 ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString(),
      completed_at: progress >= 100 ? new Date().toISOString() : undefined,
      providers: deployment.providers.map((provider) => {
        // Se o progresso chegou a 100%, forçar o status para 'up' e adicionar mensagem de sucesso
        if (progress >= 100) {
          return {
            ...provider,
            status: 'up',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'success',
                message: `✅ Deploy concluído com sucesso no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'info',
                message: `🚀 Aplicação disponível e pronta para uso no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }

        // Só adiciona logs se passou tempo suficiente desde o último log
        if (!shouldAddLog) {
          return provider;
        }

        if (provider.status === 'pending' && progress >= 10) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'debug',
                message: `Iniciando processo de deploy para ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 20) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'debug',
                message: `Analisando estrutura do projeto para ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 30) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'debug',
                message: `Verificando dependências e requisitos para ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 40) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'info',
                message: `Configurando recursos de infraestrutura no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 50) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'debug',
                message: `Preparando ambiente de execução no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 60) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'info',
                message: `Iniciando build da aplicação no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 70) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'info',
                message: `Deployando containers e serviços no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 80) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'info',
                message: `Realizando testes de integração no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        if (provider.status === 'in_progress' && progress >= 90) {
          lastLogTime = currentTime;
          return {
            ...provider,
            status: 'in_progress',
            logs: [
              ...provider.logs,
              {
                id: Math.floor(Math.random() * 1000000),
                level: 'debug',
                message: `Configurando monitoramento e logs no ${provider.slug.toUpperCase()}`,
                timestamp: new Date().toISOString(),
                deploy: deployId,
                provider: provider,
              },
            ],
          };
        }
        return provider;
      }),
    };

    const index = mockDeployments.findIndex(d => d.id === deployId);
    if (index !== -1) {
      mockDeployments[index] = updatedDeployment;
      saveDeploymentsToLocalStorage(mockDeployments);
    }

    onProgress(updatedDeployment);

    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
};
