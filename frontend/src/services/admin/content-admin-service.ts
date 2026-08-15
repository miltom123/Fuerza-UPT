import { apiClient } from "@/services/api-client";
import type { AdminContentCreate, AdminContentRow, AdminContentUpdate, AdminPage, GenericAdminModule } from "@/types/admin";

const paths: Record<GenericAdminModule, string> = {
  representation: "representacion",
  events: "eventos",
  opportunities: "oportunidades",
  statistics: "estadisticas",
};

function list(module: GenericAdminModule, page = 0, size = 20, search = "", status = "") {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (search) query.set("search", search);
  if (status) query.set("status", status);
  return apiClient<AdminPage<AdminContentRow>>(`/admin/${paths[module]}?${query}`, { cache: "no-store" });
}

function create(module: GenericAdminModule, input: AdminContentCreate) {
  return apiClient<AdminContentRow>(`/admin/${paths[module]}`, { method: "POST", body: JSON.stringify(input) });
}

function update(module: GenericAdminModule, id: string, input: AdminContentUpdate) {
  return apiClient<AdminContentRow>(`/admin/${paths[module]}/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

function changeStatus(module: GenericAdminModule, row: AdminContentRow, status: AdminContentRow["status"]) {
  return apiClient<AdminContentRow>(`/admin/${paths[module]}/${row.id}/estado-editorial`, {
    method: "PATCH",
    body: JSON.stringify({ status, version: row.version }),
  });
}

function archive(module: GenericAdminModule, id: string) {
  return apiClient<void>(`/admin/${paths[module]}/${id}`, { method: "DELETE" });
}

export const contentAdminService = { list, create, update, changeStatus, archive };
