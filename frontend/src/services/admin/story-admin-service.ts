import { apiClient } from "@/services/api-client";
import type { PageResponse } from "@/services/admin/representation-admin-service";
import type { StoryAdminRequest, StoryAdminResponse } from "@/types/story";

export const storyAdminService = {
  getStories: async (page = 0, size = 50, search?: string, status?: string, category?: string) => {
    let url = `/admin/historias?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (category && category !== "ALL") url += `&category=${encodeURIComponent(category)}`;
    return apiClient<PageResponse<StoryAdminResponse>>(url, { cache: "no-store" });
  },

  getStoryById: async (id: string) => {
    return apiClient<StoryAdminResponse>(`/admin/historias/${id}`, { cache: "no-store" });
  },

  createStory: async (body: StoryAdminRequest) => {
    return apiClient<StoryAdminResponse>("/admin/historias", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  },

  updateStory: async (id: string, body: StoryAdminRequest) => {
    return apiClient<StoryAdminResponse>(`/admin/historias/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  },

  changeStatus: async (id: string, status: string, version?: number) => {
    let url = `/admin/historias/${id}/estado?status=${encodeURIComponent(status)}`;
    if (version !== undefined) url += `&version=${version}`;
    return apiClient<StoryAdminResponse>(url, { method: "PATCH" });
  },

  archiveStory: async (id: string) => {
    return apiClient<void>(`/admin/historias/${id}`, { method: "DELETE" });
  },

  deleteStory: async (id: string, confirm = true) => {
    return apiClient<void>(`/admin/historias/${id}/permanente?confirm=${confirm}`, {
      method: "DELETE",
    });
  },
};
