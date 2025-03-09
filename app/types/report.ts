export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED",
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date;
  reportId?: string;
  userId?: string;
  report?: Report;
  user: User;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  date?: string;
  status: ReportStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId?: string;
  user: User;
  reviewer?: User;
  comments: Comment[];
}

export type ReportWithRelations = Report;

export interface ReportFormData {
  title: string;
  date: string;
  content: string;
  status: ReportStatus;
}
