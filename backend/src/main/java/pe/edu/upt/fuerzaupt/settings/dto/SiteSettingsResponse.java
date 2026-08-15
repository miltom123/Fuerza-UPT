package pe.edu.upt.fuerzaupt.settings.dto;

import java.time.Instant;

public record SiteSettingsResponse(
        String email,
        String whatsapp,
        String instagram,
        String facebook,
        String tiktok,
        String youtube,
        String address,
        String mainMessage,
        String contactText,
        Instant updatedAt,
        long version
) {
}
