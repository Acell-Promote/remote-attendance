export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  reports: T[];
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatus {
  isActive: boolean;
  lastClockIn: string | null;
}
