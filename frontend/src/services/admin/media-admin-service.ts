import { API_BASE_URL } from "@/lib/constants";
import { ApiClientError, apiClient, getCsrfHeaders } from "@/services/api-client";
import type { MediaAsset } from "@/types/admin-workflows";

function list() {
  return apiClient<MediaAsset[]>("/admin/media", { cache: "no-store" });
}
async function upload(file: File, privateAsset: boolean) {
  const form = new FormData();
  form.set("file", file);
  const response = await fetch(`${API_BASE_URL}/admin/media?privateAsset=${privateAsset}`, {
    method: "POST", credentials: "include", headers: await getCsrfHeaders(), body: form,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new ApiClientError(body?.message ?? "No se pudo subir el archivo.", response.status);
  }
  return response.json() as Promise<MediaAsset>;
}
function remove(id: string) {
  return apiClient<void>(`/admin/media/${id}`, { method: "DELETE" });
}
export const mediaAdminService = { list, upload, remove };
