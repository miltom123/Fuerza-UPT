import { apiClient } from "@/services/api-client";
import type { SiteSettings } from "@/types/admin-workflows";

function get() {
  return apiClient<SiteSettings>("/admin/configuracion", { cache: "no-store" });
}
function update(input: SiteSettings) {
  const payload = {
    email: input.email,
    whatsapp: input.whatsapp,
    instagram: input.instagram,
    facebook: input.facebook,
    tiktok: input.tiktok,
    youtube: input.youtube,
    address: input.address,
    mainMessage: input.mainMessage,
    contactText: input.contactText,
    version: input.version,
  };
  return apiClient<SiteSettings>("/admin/configuracion", { method: "PUT", body: JSON.stringify(payload) });
}
export const settingsAdminService = { get, update };
