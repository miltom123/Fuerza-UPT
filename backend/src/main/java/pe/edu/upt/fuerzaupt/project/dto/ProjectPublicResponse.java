package pe.edu.upt.fuerzaupt.project.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectPublicResponse(
    UUID id,
    String slug,
    String title,
    String summary,
    String category,
    String coverImage,
    String coverAltText,
    String problem,
    String objective,
    String beneficiaries,
    LocalDate startDate,
    LocalDate endDate,
    String projectStatus,
    String status,
    List<String> responsibleNames,
    List<String> partnerNames,
    List<String> results,
    List<String> gallery,
    List<String> eventIds,
    boolean featured,
    int displayOrder
) {}
