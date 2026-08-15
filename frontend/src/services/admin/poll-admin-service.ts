import { apiClient } from "@/services/api-client";
import type { PollAdminDetail, PollMutation, PollPage, PollResults, PollStatus } from "@/types/poll";

function list(page = 0, size = 20) {
  return apiClient<PollPage>(`/admin/encuestas?page=${page}&size=${size}`, { cache: "no-store" });
}
function create(input: PollMutation) {
  return apiClient<PollAdminDetail>("/admin/encuestas", { method: "POST", body: JSON.stringify(input) });
}
function detail(id: string) {
  return apiClient<PollAdminDetail>(`/admin/encuestas/${id}`, { cache: "no-store" });
}
function update(id: string, input: PollMutation) {
  return apiClient<PollAdminDetail>(`/admin/encuestas/${id}`, { method: "PUT", body: JSON.stringify(input) });
}
function changeStatus(id: string, status: PollStatus, version: number) {
  return apiClient<PollAdminDetail>(`/admin/encuestas/${id}/estado`, {
    method: "PATCH", body: JSON.stringify({ status, version }),
  });
}
function results(id: string) {
  return apiClient<PollResults>(`/admin/encuestas/${id}/resultados`, { cache: "no-store" });
}
function archive(id: string) {
  return apiClient<void>(`/admin/encuestas/${id}`, { method: "DELETE" });
}
export const pollAdminService = { list, create, detail, update, changeStatus, results, archive };
