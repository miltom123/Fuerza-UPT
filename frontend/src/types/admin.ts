export type AdminModule =
  | "representation"
  | "projects"
  | "events"
  | "opportunities"
  | "team"
  | "statistics";

export type GenericAdminModule = Exclude<AdminModule, "team" | "projects">;

export interface AdminModuleSummary {
  module: AdminModule;
  total: number;
  published: number;
  drafts: number;
  archived: number;
}

export interface AdminContentRow {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  updatedAt: string;
  version: number;
}

export interface AdminPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminContentCreate {
  slug: string;
  title: string;
  summary?: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  displayOrder: number;
  coverImage?: string;
  category?: string;
  description?: string;
  domainStatus?: string;
  startDate?: string;
  endDate?: string;
  modality?: string;
  organizer?: string;
  institution?: string;
  body?: string;
  value?: string;
  beneficiaryArea?: string;
  proposalOrManagement?: string;
  result?: string;
  progress?: string;
  capacity?: number;
  registrationMode?: string;
  registrationUrl?: string;
  officialUrl?: string;
  applicationUrl?: string;
  role?: string;
  area?: string;
}

export interface AdminContentUpdate {
  title: string;
  summary?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  version: number;
  category?: string;
  description?: string;
  domainStatus?: string;
  startDate?: string;
  endDate?: string;
  modality?: string;
  organizer?: string;
  institution?: string;
  body?: string;
  value?: string;
  beneficiaryArea?: string;
  proposalOrManagement?: string;
  result?: string;
  progress?: string;
  capacity?: number;
  registrationMode?: string;
  registrationUrl?: string;
  officialUrl?: string;
  applicationUrl?: string;
  role?: string;
  area?: string;
}
