package pe.edu.upt.fuerzaupt.project.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateProjectRequest(
    @NotBlank String title,
    @NotBlank String summary,
    String category,
    @NotBlank String problem,
    @NotBlank String objective,
    @NotBlank String beneficiaries,
    @NotNull LocalDate startDate,
    LocalDate endDate,
    @NotBlank String projectStatus,
    @NotBlank String contentStatus,
    List<OrderedTextRequest> responsibles,
    List<OrderedTextRequest> partners,
    List<OrderedTextRequest> results,
    List<UUID> linkedEventIds,
    boolean featured,
    @Min(0) int displayOrder,
    @Min(0) long version
) {}
