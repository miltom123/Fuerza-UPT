import { apiClient } from '@/services/api-client';
import { AdminPage } from '@/types/admin';
import { MediaAsset } from '@/types/admin-workflows';

export interface OrderedTextResponse {
  id?: string;
  text: string;
  displayOrder: number;
}

export interface ProjectEventReferenceResponse {
  id: string;
  eventId: string;
  title: string;
  startDate: string;
  displayOrder: number;
}

export interface ProjectAdminResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  coverImage: MediaAsset | null;
  coverAltText: string | null;
  problem: string | null;
  objective: string | null;
  beneficiaries: string | null;
  startDate: string | null;
  endDate: string | null;
  projectStatus: string;
  contentStatus: string;
  responsibles: OrderedTextResponse[];
  partners: OrderedTextResponse[];
  results: OrderedTextResponse[];
  linkedEvents: ProjectEventReferenceResponse[];
  gallery: MediaAsset[];
  featured: boolean;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ProjectCreateRequest {
  title: string;
  summary: string;
  category: string;
  problem: string;
  objective: string;
  beneficiaries: string;
  startDate: string | null;
  endDate: string | null;
  projectStatus: string;
  responsibles: OrderedTextResponse[];
  partners: OrderedTextResponse[];
  results: OrderedTextResponse[];
  linkedEventIds: string[];
  publishNow: boolean;
  featured: boolean;
}

export interface ProjectUpdateRequest extends Omit<ProjectCreateRequest, 'publishNow'> {
  contentStatus: string;
  displayOrder: number;
  version: number;
}

export interface ProjectOrderEntry {
  id: string;
  order: number;
}

export const projectAdminService = {
  async getProjects(page = 0, size = 20, search?: string, status?: string): Promise<AdminPage<ProjectAdminResponse>> {
    let url = `/admin/proyectos?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return apiClient<AdminPage<ProjectAdminResponse>>(url, { cache: "no-store" });
  },

  async getProject(id: string): Promise<ProjectAdminResponse> {
    return apiClient<ProjectAdminResponse>(`/admin/proyectos/${id}`, { cache: "no-store" });
  },

  async createProject(data: ProjectCreateRequest, image?: File): Promise<ProjectAdminResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return apiClient<ProjectAdminResponse>('/admin/proyectos', { method: 'POST', body: formData });
  },

  async updateProject(id: string, data: ProjectUpdateRequest, image?: File, removeImage = false): Promise<ProjectAdminResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    let url = `/admin/proyectos/${id}`;
    if (removeImage) url += `?removeImage=true`;
    return apiClient<ProjectAdminResponse>(url, { method: 'PUT', body: formData });
  },

  async changeStatus(id: string, status: string, version: number): Promise<ProjectAdminResponse> {
    return apiClient<ProjectAdminResponse>(`/admin/proyectos/${id}/estado-editorial`, {
      method: 'PATCH',
      body: JSON.stringify({ status, version })
    });
  },

  async reorderProjects(orders: ProjectOrderEntry[]): Promise<ProjectAdminResponse[]> {
    return apiClient<ProjectAdminResponse[]>('/admin/proyectos/orden', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    });
  },

  async archiveProject(id: string): Promise<void> {
    return apiClient<void>(`/admin/proyectos/${id}`, { method: 'DELETE' });
  },

  async deleteProject(id: string, confirm = false): Promise<void> {
    return apiClient<void>(`/admin/proyectos/${id}/permanente?confirm=${confirm}`, { method: 'DELETE' });
  }
};
