package pe.edu.upt.fuerzaupt.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminSubmissionResponse(
        UUID id,
        String type,
        String name,
        String email,
        String context,
        String body,
        String status,
        String notes,
        UUID assignedTo,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
