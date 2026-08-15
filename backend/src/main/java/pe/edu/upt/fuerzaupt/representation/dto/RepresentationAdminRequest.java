package pe.edu.upt.fuerzaupt.representation.dto;

import java.util.List;

public record RepresentationAdminRequest(
        String title,
        String slug,
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
        List<String> actions,
        List<String> evidence
) {}
