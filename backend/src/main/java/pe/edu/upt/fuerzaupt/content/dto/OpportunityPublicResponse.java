package pe.edu.upt.fuerzaupt.content.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OpportunityPublicResponse(
        UUID id, String slug, String title, String summary, String coverImage,
        Instant publishedAt, Instant updatedAt, String status, boolean featured,
        int displayOrder,
        String opportunityType, String institution, String description,
        List<String> benefits, List<String> requirements, LocalDate deadline,
        String countryOrModality, String officialUrl, String applicationUrl,
        String opportunityStatus
) {
}
