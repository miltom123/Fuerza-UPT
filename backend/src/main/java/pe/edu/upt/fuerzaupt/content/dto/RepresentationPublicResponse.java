package pe.edu.upt.fuerzaupt.content.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RepresentationPublicResponse(
        UUID id, String slug, String title, String summary, String coverImage,
        Instant publishedAt, Instant updatedAt, String status, boolean featured,
        int displayOrder,
        String kind, String progress, String beneficiaryArea, String identifiedProblem,
        String proposalOrManagement, List<String> actionsTaken, String result,
        List<String> evidenceUrls, Integer progressPercentage, String impactLevel, 
        UUID relatedProjectId, UUID relatedEventId,
        UUID relatedOpportunityId
) {
}
