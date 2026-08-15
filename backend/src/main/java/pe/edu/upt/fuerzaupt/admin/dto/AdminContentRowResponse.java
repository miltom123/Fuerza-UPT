package pe.edu.upt.fuerzaupt.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminContentRowResponse(
        UUID id,
        String slug,
        String title,
        String summary,
        String coverImage,
        String status,
        boolean featured,
        int displayOrder,
        Instant updatedAt,
        long version
) {
}
