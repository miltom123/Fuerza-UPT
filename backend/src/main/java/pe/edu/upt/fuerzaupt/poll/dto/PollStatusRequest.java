package pe.edu.upt.fuerzaupt.poll.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PollStatusRequest(
        @Pattern(regexp = "DRAFT|SCHEDULED|OPEN|CLOSED|ARCHIVED") String status,
        @NotNull @Min(0) Long version
) {
}
