import { apiClient } from "@/services/api-client";
import type { SiteSettings } from "@/types/admin-workflows";

export function getPublicSettings() {
  return apiClient<SiteSettings>("/configuracion-publica", {
    next: { revalidate: 3600, tags: ["site-settings"] },
  }).catch(() => ({} as SiteSettings));
}
