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

export type ClockStatus = "idle" | "clocked-in" | "loading";

export interface AttendanceState {
  status: ClockStatus;
  lastClockIn: Date | null;
  error: string;
}

export interface AttendanceHistoryState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string;
  currentPage: number;
}
