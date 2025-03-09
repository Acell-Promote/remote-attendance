export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  reports: T[];
  total: number;
  page: number;
  totalPages: number;
}
