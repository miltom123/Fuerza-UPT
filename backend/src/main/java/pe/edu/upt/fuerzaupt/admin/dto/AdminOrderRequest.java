package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AdminOrderRequest(
        @NotEmpty @Size(max = 100) List<@Valid AdminOrderItemRequest> items
) {
}
