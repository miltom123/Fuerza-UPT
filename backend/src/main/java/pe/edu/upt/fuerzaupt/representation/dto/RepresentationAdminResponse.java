package pe.edu.upt.fuerzaupt.representation.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RepresentationAdminResponse(
        UUID id,
        String slug,
        String title,
        String summary,
        String coverImageUrl,
        String contentStatus,
        Boolean featured,
        Integer displayOrder,
        String kind,
        String progress,
        Integer progressPercentage,
        String impactLevel,
        String beneficiaryArea,
        String identifiedProblem,
        String proposalOrManagement,
        String result,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt,
        Long version,
        List<String> actions,
        List<String> evidence
) {}
