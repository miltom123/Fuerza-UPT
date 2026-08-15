package pe.edu.upt.fuerzaupt.poll.dto;

import java.time.Instant;
import java.util.UUID;

public record PollSubmissionResponse(
        UUID responseId,
        Instant submittedAt
) {
}
