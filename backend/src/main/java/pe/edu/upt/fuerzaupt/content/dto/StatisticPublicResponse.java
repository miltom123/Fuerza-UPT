package pe.edu.upt.fuerzaupt.content.dto;

import java.time.Instant;

public record StatisticPublicResponse(
        String id, String value, String label, boolean isVerified,
        String source, Instant updatedAt
) {
}
