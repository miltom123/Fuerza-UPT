package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdminFeaturedRequest(
        @NotNull Boolean featured,
        @NotNull @Min(0) Long version
) {
}
