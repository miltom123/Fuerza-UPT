package pe.edu.upt.fuerzaupt.team.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record TeamMemberOrderRequest(
        @NotEmpty @Size(max = 100) List<@Valid Item> items
) {
    public record Item(
            @NotNull UUID id,
            @NotNull @Min(0) Long version
    ) {
    }
}
