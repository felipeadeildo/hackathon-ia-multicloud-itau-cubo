export interface DeployStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  message: string;
  timestamp: string;
}

export interface LogEntry {
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export const mockDeployStatus: DeployStatus = {
  status: 'in_progress',
  progress: 0,
  message: 'Iniciando deploy...',
  timestamp: new Date().toISOString(),
};

export const mockLogs: LogEntry[] = [
  {
    level: 'info',
    message: 'Iniciando processo de deploy',
    timestamp: new Date(Date.now() - 5000).toISOString(),
  },
  {
    level: 'info',
    message: 'Verificando dependências',
    timestamp: new Date(Date.now() - 4000).toISOString(),
  },
  {
    level: 'success',
    message: 'Dependências verificadas com sucesso',
    timestamp: new Date(Date.now() - 3000).toISOString(),
  },
  {
    level: 'info',
    message: 'Construindo aplicação',
    timestamp: new Date(Date.now() - 2000).toISOString(),
  },
  {
    level: 'warning',
    message: 'Algumas dependências estão desatualizadas',
    timestamp: new Date(Date.now() - 1000).toISOString(),
  },
];

export const simulateDeploy = (onProgress: (status: DeployStatus) => void) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    const status: DeployStatus = {
      status: progress >= 100 ? 'completed' : 'in_progress',
      progress,
      message: progress >= 100 ? 'Deploy concluído com sucesso!' : 'Deploy em andamento...',
      timestamp: new Date().toISOString(),
    };
    onProgress(status);
    
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 1000);
}; 