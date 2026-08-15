import { apiClient } from "@/services/api-client";
import type { AdminDashboardData } from "@/types/admin-workflows";

export function getAdminDashboard() {
  return apiClient<AdminDashboardData>("/admin/dashboard", { cache: "no-store" });
}
