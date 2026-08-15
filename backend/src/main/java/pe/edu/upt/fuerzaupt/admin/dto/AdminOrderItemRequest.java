package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AdminOrderItemRequest(
        @NotNull UUID id,
        @NotNull @Min(0) Long version,
        @NotNull @Min(0) Integer displayOrder
) {
}
