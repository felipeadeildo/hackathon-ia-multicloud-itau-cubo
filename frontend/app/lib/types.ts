// Provider types - matching Django model choices exactly
export type ProviderStatus = "in_progress" | "up" | "down";

export interface Provider {
  id: number;
  slug: string;
  status: ProviderStatus;
  created_at: string;
  updated_at: string;
}

// Deploy types - simplified structure
export interface Deploy {
  id: number;
  github_repo_url: string;
  providers: Provider[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DeployCreateRequest {
  github_repo_url: string;
  providers: string[]; // Array of provider slugs
}

// Log types - matching Django model choices exactly
export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

export interface Log {
  id: number;
  deploy: number;
  provider: Provider;
  message: string;
  level: LogLevel;
  timestamp: string;
}

export interface LogFilters {
  provider?: string;
  level?: LogLevel;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[]>;
}

// Pagination types (for future use if Django REST framework pagination is added)
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
