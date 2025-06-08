import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


import type { Deploy, DeployStatus } from './types'

// Helper function to get deploy status based on providers and completion
export function getDeployStatus(deploy: Deploy): DeployStatus {
  if (deploy.completed_at) {
    // If completed, check if any provider failed
    const hasFailed = deploy.providers.some(p => p.status === 'down')
    return hasFailed ? 'failed' : 'completed'
  }
  
  // If not completed, check provider statuses
  const hasInProgress = deploy.providers.some(p => p.status === 'in_progress')
  if (hasInProgress) {
    return 'in_progress'
  }
  
  // If no providers are in progress but deployment isn't completed
  return 'pending'
}

// Helper to get repo name from GitHub URL
export function getRepoName(url: string): string {
  try {
    const parts = url.split('/')
    return parts[parts.length - 1] || url
  } catch {
    return url
  }
}

// Helper to get repo owner from GitHub URL  
export function getRepoOwner(url: string): string {
  try {
    const parts = url.split('/')
    return parts[parts.length - 2] || ''
  } catch {
    return ''
  }
}

// Helper to format dates
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Helper to format dates with seconds
export function formatDateWithSeconds(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}