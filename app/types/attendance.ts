export interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  plannedClockOut: string;
  breakMinutes: number;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

export interface AttendanceStatus {
  isActive: boolean;
  lastClockIn: string | null;
  plannedClockOut: string | null;
}

export type ClockStatus = "idle" | "clocked-in" | "loading";

export interface AttendanceState {
  status: ClockStatus;
  lastClockIn: Date | null;
  plannedClockOut: Date | null;
  error: string;
}

export interface AttendanceHistoryState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string;
  currentPage: number;
}
