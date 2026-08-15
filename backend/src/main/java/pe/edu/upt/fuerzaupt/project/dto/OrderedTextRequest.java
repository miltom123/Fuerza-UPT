package pe.edu.upt.fuerzaupt.project.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderedTextRequest(
    @NotBlank String text,
    @Min(0) int displayOrder
) {
}
