import { useEffect, useState } from 'react';
import type { DeployStatus, LogEntry } from '../lib/mockData';
import { mockDeployStatus, mockLogs, simulateDeploy } from '../lib/mockData';
import { Progress } from '../components/ui/progress';

export function DeployStatusComponent() {
  const [deployStatus, setDeployStatus] = useState<DeployStatus>(mockDeployStatus);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);

  useEffect(() => {
    simulateDeploy((status) => {
      setDeployStatus(status);
      if (status.status === 'completed') {
        setLogs((prevLogs) => [
          ...prevLogs,
          {
            level: 'success',
            message: 'Deploy concluído com sucesso!',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    });
  }, []);

  const getStatusColor = (status: DeployStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'in_progress':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Status do Deploy</h2>
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getStatusColor(deployStatus.status)}`}>
            {deployStatus.message}
          </span>
        </div>
        <Progress value={deployStatus.progress} className="w-full" />
        <span className="text-sm text-gray-500">
          {deployStatus.progress}% completo
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Logs</h2>
        <div className="bg-gray-100 p-4 rounded-lg space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className={`font-medium ${getLogColor(log.level)}`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="flex-1">{log.message}</span>
              <span className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 