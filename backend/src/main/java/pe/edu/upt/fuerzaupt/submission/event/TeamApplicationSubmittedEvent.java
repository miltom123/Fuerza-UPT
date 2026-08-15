package pe.edu.upt.fuerzaupt.submission.event;

import java.util.UUID;

public record TeamApplicationSubmittedEvent(
        UUID id,
        String fullName,
        String email,
        String motivation
) {
}
