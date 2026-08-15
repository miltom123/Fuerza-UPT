package pe.edu.upt.fuerzaupt.project.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ProjectEventReferenceResponse(
    UUID id,
    String slug,
    String title,
    LocalDate startDate,
    String eventStatus,
    String modality
) {}
