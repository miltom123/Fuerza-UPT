package pe.edu.upt.fuerzaupt.team.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TeamMemberStatusRequest(
        @NotBlank @Pattern(regexp = "DRAFT|PUBLISHED|ARCHIVED") String status,
        @NotNull @Min(0) Long version
) {
}
