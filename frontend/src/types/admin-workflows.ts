import type { AdminPage } from "@/types/admin";

export interface AdminAuditItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  requestId?: string;
}

export interface DailyVisitStat {
  date: string;
  label: string;
  visits: number;
  uniqueVisitors: number;
}

export interface SubmissionsSummary {
  contactMessages: number;
  teamApplications: number;
  studentProposals: number;
  newsletterSubscriptions: number;
  eventRegistrations: number;
  total: number;
}

export interface AdminDashboardData {
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
  interactions: number;
  published: number;
  drafts: number;
  archived: number;
  pendingSubmissions: number;
  dailyVisits: DailyVisitStat[];
  submissionsSummary: SubmissionsSummary;
  content: Record<string, number>;
  recentActivity: AdminAuditItem[];
}

export type SubmissionType = "contactos" | "propuestas" | "postulaciones" | "suscripciones" | "inscripciones";
export type SubmissionStatus = "NEW" | "IN_REVIEW" | "RESOLVED" | "REJECTED" | "SPAM";

export interface AdminSubmission {
  id: string;
  type: string;
  name: string;
  email?: string;
  context?: string;
  body?: string;
  status: SubmissionStatus;
  notes?: string;
  assignedTo?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  bucketName: string;
  url: string;
  privateAsset: boolean;
  createdAt: string;
}

export interface SiteSettings {
  email?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  address?: string;
  mainMessage?: string;
  contactText?: string;
  updatedAt: string;
  version: number;
}

export type SubmissionPage = AdminPage<AdminSubmission>;
