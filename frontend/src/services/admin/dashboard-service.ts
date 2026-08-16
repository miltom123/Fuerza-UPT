import { apiClient } from "@/services/api-client";
import type { AdminDashboardData } from "@/types/admin-workflows";

export function getAdminDashboard(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiClient<AdminDashboardData>(`/admin/dashboard${query}`, { cache: "no-store" });
}
