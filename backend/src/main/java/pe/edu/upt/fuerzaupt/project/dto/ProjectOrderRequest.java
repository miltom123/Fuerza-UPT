package pe.edu.upt.fuerzaupt.project.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record ProjectOrderRequest(
        @NotEmpty List<ProjectOrderEntry> orders
) {
    public record ProjectOrderEntry(
            @NotNull UUID id,
            @NotNull Integer order
    ) {}
}
