import { apiClient } from '@/services/api-client';
import { AdminPage } from '@/types/admin';
import { MediaAsset } from '@/types/admin-workflows';

export interface EventAdminResponse {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  coverImage: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  time: string | null;
  modality: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location: string | null;
  organizer: string;
  speakerNames: string[];
  capacity: number | null;
  eventStatus: 'UPCOMING' | 'REGISTRATION_OPEN' | 'FULL' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  contentStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  registrationEnabled: boolean;
  registrationUrl: string | null;
  relatedProjectId: string | null;
  featured: boolean;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface EventCreateRequest {
  title: string;
  summary: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string | null;
  time: string;
  modality: string;
  location: string;
  organizer: string;
  speakerNames: string[];
  capacity: number | null;
  eventStatus: string;
  registrationEnabled: boolean;
  registrationUrl: string;
  relatedProjectId: string | null;
  publishNow: boolean;
  featured: boolean;
}

export interface EventUpdateRequest extends Omit<EventCreateRequest, 'publishNow'> {
  contentStatus: string;
  displayOrder: number;
  version: number;
}

export const eventAdminService = {
  async getEvents(page = 0, size = 20, search?: string, status?: string): Promise<AdminPage<EventAdminResponse>> {
    let url = `/admin/eventos?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return apiClient<AdminPage<EventAdminResponse>>(url, { cache: "no-store" });
  },

  async getEvent(id: string): Promise<EventAdminResponse> {
    return apiClient<EventAdminResponse>(`/admin/eventos/${id}`, { cache: "no-store" });
  },

  async createEvent(data: EventCreateRequest, image?: File): Promise<EventAdminResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return apiClient<EventAdminResponse>('/admin/eventos', { method: 'POST', body: formData });
  },

  async updateEvent(id: string, data: EventUpdateRequest, image?: File, removeImage = false): Promise<EventAdminResponse> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    let url = `/admin/eventos/${id}`;
    if (removeImage) url += `?removeImage=true`;
    return apiClient<EventAdminResponse>(url, { method: 'PUT', body: formData });
  },

  async changeStatus(id: string, status: string, version: number): Promise<EventAdminResponse> {
    return apiClient<EventAdminResponse>(`/admin/eventos/${id}/estado-editorial`, {
      method: 'PATCH',
      body: JSON.stringify({ status, version })
    });
  },

  async archiveEvent(id: string): Promise<void> {
    return apiClient<void>(`/admin/eventos/${id}`, { method: 'DELETE' });
  },

  async deleteEvent(id: string, confirm = false): Promise<void> {
    return apiClient<void>(`/admin/eventos/${id}/permanente?confirm=${confirm}`, { method: 'DELETE' });
  }
};
