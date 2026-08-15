package pe.edu.upt.fuerzaupt.project.dto;

import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectAdminResponse(
    UUID id,
    String slug,
    String title,
    String summary,
    String category,
    MediaAssetResponse coverImage,
    String coverAltText,
    String problem,
    String objective,
    String beneficiaries,
    LocalDate startDate,
    LocalDate endDate,
    String projectStatus,
    String contentStatus,
    List<OrderedTextResponse> responsibles,
    List<OrderedTextResponse> partners,
    List<OrderedTextResponse> results,
    List<ProjectEventReferenceResponse> linkedEvents,
    List<MediaAssetResponse> gallery,
    boolean featured,
    int displayOrder,
    Instant publishedAt,
    Instant createdAt,
    Instant updatedAt,
    long version
) {}
