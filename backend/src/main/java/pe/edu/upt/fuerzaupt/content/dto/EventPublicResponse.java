package pe.edu.upt.fuerzaupt.content.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record EventPublicResponse(
        UUID id, String slug, String title, String summary, String coverImage,
        Instant publishedAt, Instant updatedAt, String status, boolean featured,
        int displayOrder,
        String category, String description, LocalDate startDate, LocalDate endDate,
        String time, String modality, String location, String organizer,
        List<String> speakerNames, boolean registrationEnabled, String registrationUrl,
        Integer capacity, String eventStatus, UUID relatedProjectId
) {
}
