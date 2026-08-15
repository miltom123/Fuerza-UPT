import { apiClient } from "@/services/api-client";

export interface RepresentationAdminResponse {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  contentStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  kind: "LOGRO" | "PROPUESTA" | "GESTION" | "ACUERDO";
  progress: string;
  progressPercentage: number;
  impactLevel?: string;
  beneficiaryArea?: string;
  identifiedProblem?: string;
  proposalOrManagement?: string;
  result?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  actions: string[];
  evidence: string[];
}

export interface RepresentationAdminRequest {
  title: string;
  slug?: string;
  summary?: string;
  coverImageUrl?: string;
  contentStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  featured?: boolean;
  displayOrder?: number;
  kind?: string;
  progress?: string;
  progressPercentage?: number;
  impactLevel?: string;
  beneficiaryArea?: string;
  identifiedProblem?: string;
  proposalOrManagement?: string;
  result?: string;
  actions?: string[];
  evidence?: string[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const representationAdminService = {
  getItems: async (page = 0, size = 50, search?: string, status?: string) => {
    let url = `/admin/representacion-estudiantil?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return apiClient<PageResponse<RepresentationAdminResponse>>(url, { cache: "no-store" });
  },

  getItemById: async (id: string) => {
    return apiClient<RepresentationAdminResponse>(`/admin/representacion-estudiantil/${id}`, { cache: "no-store" });
  },

  createItem: async (body: RepresentationAdminRequest) => {
    return apiClient<RepresentationAdminResponse>("/admin/representacion-estudiantil", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  },

  updateItem: async (id: string, body: RepresentationAdminRequest) => {
    return apiClient<RepresentationAdminResponse>(`/admin/representacion-estudiantil/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  },

  changeStatus: async (id: string, status: string, version?: number) => {
    let url = `/admin/representacion-estudiantil/${id}/estado?status=${encodeURIComponent(status)}`;
    if (version !== undefined) url += `&version=${version}`;
    return apiClient<RepresentationAdminResponse>(url, { method: "PATCH" });
  },

  archiveItem: async (id: string) => {
    return apiClient<void>(`/admin/representacion-estudiantil/${id}`, { method: "DELETE" });
  },

  deleteItem: async (id: string, confirm = true) => {
    return apiClient<void>(`/admin/representacion-estudiantil/${id}/permanente?confirm=${confirm}`, {
      method: "DELETE",
    });
  },
};
