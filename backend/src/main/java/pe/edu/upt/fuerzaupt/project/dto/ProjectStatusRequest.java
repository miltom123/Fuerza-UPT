package pe.edu.upt.fuerzaupt.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusRequest(
        @NotBlank String status,
        @NotNull Long version
) {
}
