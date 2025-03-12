export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  reports: T[];
  total: number;
  page: number;
  totalPages: number;
}
