package pe.edu.upt.fuerzaupt.poll.dto;

import java.time.Instant;
import java.util.UUID;

public record PollSummaryResponse(
        UUID id,
        String slug,
        String title,
        String description,
        String status,
        Instant startAt,
        Instant endAt,
        boolean allowAnonymous,
        boolean showResults,
        boolean featured,
        Instant createdAt,
        Instant updatedAt,
        long version
) {
}
