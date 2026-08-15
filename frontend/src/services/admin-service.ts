import type {
  AdminContentCreate,
  AdminContentRow,
  AdminContentUpdate,
  AdminModule,
  AdminModuleSummary,
  AdminPage,
} from "@/types/admin";
import { apiClient } from "./api-client";

function summaries() {
  return apiClient<AdminModuleSummary[]>("/admin/content", { cache: "no-store" });
}

function list(module: AdminModule, page = 0, size = 20) {
  return apiClient<AdminPage<AdminContentRow>>(
    `/admin/content/${module}?page=${page}&size=${size}`,
    { cache: "no-store" },
  );
}

function create(module: AdminModule, input: AdminContentCreate) {
  return apiClient<AdminContentRow>(`/admin/content/${module}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function update(module: AdminModule, id: string, input: AdminContentUpdate) {
  return apiClient<AdminContentRow>(`/admin/content/${module}/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

function archive(module: AdminModule, id: string) {
  return apiClient<void>(`/admin/content/${module}/${id}`, { method: "DELETE" });
}

export const adminService = { summaries, list, create, update, archive };
