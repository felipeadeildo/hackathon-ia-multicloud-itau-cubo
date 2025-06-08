import type { ApiError } from './types'
import { mockDeployments, addMockDeployment, getMockDeploymentById, simulateDeploymentProgress } from './mockDeployData'
import type { Deploy, DeployCreateRequest } from './types'

class MockApiClient {
  async get<T>(endpoint: string): Promise<T> {
    // Simular um pequeno delay para parecer uma chamada real
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retornar todos os deployments
    if (endpoint === '/deployments/') {
      return mockDeployments as T;
    }

    // Retornar um deployment específico por ID
    if (endpoint.startsWith('/deployments/')) {
      const parts = endpoint.split('/');
      const id = parseInt(parts[2]);
      if (isNaN(id)) {
        throw new Error('ID de deployment inválido');
      }
      const deployment = getMockDeploymentById(id);
      if (!deployment) {
        throw new Error('Deployment não encontrado');
      }
      return deployment as T;
    }

    throw new Error('Endpoint não encontrado');
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint === '/deployments/') {
      const newDeployment = addMockDeployment(data as DeployCreateRequest);
      simulateDeploymentProgress(newDeployment.id, (updatedDeployment) => {
        console.log(`Mock deployment ${updatedDeployment.id} progress: ${updatedDeployment.progress}%`);
      });
      return newDeployment as T;
    }

    throw new Error('Endpoint não encontrado');
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Método não implementado');
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Método não implementado');
  }

  async delete<T>(endpoint: string): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Método não implementado');
  }
}

// Export singleton instance
export const apiClient = new MockApiClient();

// Export class for testing purposes
export { MockApiClient as ApiClient }
