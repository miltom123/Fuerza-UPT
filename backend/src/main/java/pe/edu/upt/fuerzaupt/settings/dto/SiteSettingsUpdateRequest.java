package pe.edu.upt.fuerzaupt.settings.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SiteSettingsUpdateRequest(
        @Email @Size(max = 255) String email,
        @Size(max = 100) String whatsapp,
        @Size(max = 2000) String instagram,
        @Size(max = 2000) String facebook,
        @Size(max = 2000) String tiktok,
        @Size(max = 2000) String youtube,
        @Size(max = 500) String address,
        @Size(max = 600) String mainMessage,
        @Size(max = 1000) String contactText,
        @NotNull @Min(0) Long version
) {
}
