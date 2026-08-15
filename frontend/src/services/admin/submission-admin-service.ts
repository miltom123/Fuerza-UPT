import { apiClient } from "@/services/api-client";
import type { AdminSubmission, SubmissionPage, SubmissionStatus, SubmissionType } from "@/types/admin-workflows";

function list(type: SubmissionType, status = "") {
  const query = status ? `?status=${status}` : "";
  return apiClient<SubmissionPage>(`/admin/formularios/${type}${query}`, { cache: "no-store" });
}
function updateStatus(type: SubmissionType, id: string, status: SubmissionStatus) {
  return apiClient<AdminSubmission>(`/admin/formularios/${type}/${id}/estado`, {
    method: "PATCH", body: JSON.stringify({ status }),
  });
}
function updateNotes(type: SubmissionType, id: string, notes: string) {
  return apiClient<AdminSubmission>(`/admin/formularios/${type}/${id}/notas`, {
    method: "PATCH", body: JSON.stringify({ notes }),
  });
}
export const submissionAdminService = { list, updateStatus, updateNotes };
