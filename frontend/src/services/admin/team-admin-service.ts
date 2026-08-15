import { API_BASE_URL } from "@/lib/constants";
import { ApiClientError, apiClient, getCsrfHeaders } from "@/services/api-client";
import type { AdminPage } from "@/types/admin";
import type {
  TeamMemberAdmin,
  TeamMemberCreate,
  TeamMemberStatus,
  TeamMemberUpdate,
} from "@/types/team-member";

interface ListOptions {
  search?: string;
  status?: TeamMemberStatus | "ALL";
  page?: number;
  size?: number;
}

function list(options: ListOptions = {}) {
  const query = new URLSearchParams({
    page: String(options.page ?? 0),
    size: String(options.size ?? 100),
  });
  if (options.search?.trim()) query.set("search", options.search.trim());
  if (options.status && options.status !== "ALL") query.set("status", options.status);
  return apiClient<AdminPage<TeamMemberAdmin>>(`/admin/equipo?${query}`, { cache: "no-store" });
}

function detail(id: string) {
  return apiClient<TeamMemberAdmin>(`/admin/equipo/${id}`, { cache: "no-store" });
}

async function multipart(
  path: string,
  method: "POST" | "PUT",
  data: TeamMemberCreate | TeamMemberUpdate,
  image?: File,
) {
  const form = new FormData();
  form.set("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (image) form.set("image", image);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: await getCsrfHeaders(),
    body: form,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { code?: string; message?: string } | null;
    throw new ApiClientError(body?.message ?? "No se pudo guardar el integrante.", response.status, body?.code);
  }
  return response.json() as Promise<TeamMemberAdmin>;
}

function create(data: TeamMemberCreate, image: File) {
  return multipart("/admin/equipo", "POST", data, image);
}

function update(id: string, data: TeamMemberUpdate, image?: File, removeImage = false) {
  return multipart(`/admin/equipo/${id}?removeImage=${removeImage}`, "PUT", data, image);
}

function changeStatus(id: string, status: TeamMemberStatus, version: number) {
  return apiClient<TeamMemberAdmin>(`/admin/equipo/${id}/estado-editorial`, {
    method: "PATCH",
    body: JSON.stringify({ status, version }),
  });
}

function reorder(items: TeamMemberAdmin[]) {
  return apiClient<TeamMemberAdmin[]>("/admin/equipo/orden", {
    method: "PATCH",
    body: JSON.stringify({ items: items.map(({ id, version }) => ({ id, version })) }),
  });
}

function archive(id: string) {
  return apiClient<void>(`/admin/equipo/${id}`, { method: "DELETE" });
}

function removePermanently(id: string) {
  return apiClient<void>(`/admin/equipo/${id}/permanente?confirm=true`, { method: "DELETE" });
}

export const teamAdminService = {
  archive,
  changeStatus,
  create,
  detail,
  list,
  removePermanently,
  reorder,
  update,
};
