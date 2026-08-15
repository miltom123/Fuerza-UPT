package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AdminEditorialStatusRequest(
        @Pattern(regexp = "DRAFT|PUBLISHED|ARCHIVED") String status,
        @NotNull @Min(0) Long version
) {
}
