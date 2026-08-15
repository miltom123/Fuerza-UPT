import { apiClient } from "@/services/api-client";
import type { PollDetail, PollResults, PollSubmissionRequest, PollSummary } from "@/types/poll";

export function getActivePolls() {
  return apiClient<PollSummary[]>("/encuestas/activas", { next: { revalidate: 300, tags: ["polls"] } }).catch(() => []);
}
export function getPoll(slug: string) {
  return apiClient<PollDetail>(`/encuestas/${slug}`, { next: { revalidate: 300, tags: ["polls"] } });
}
export function submitPoll(id: string, input: PollSubmissionRequest) {
  return apiClient<{ responseId: string; submittedAt: string }>(`/encuestas/${id}/respuestas`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export function getPollResults(id: string) {
  return apiClient<PollResults>(`/encuestas/${id}/resultados`, { cache: "no-store" });
}
