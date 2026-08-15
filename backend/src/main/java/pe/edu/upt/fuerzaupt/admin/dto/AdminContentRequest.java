package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AdminContentRequest(
        @NotBlank @Size(max = 180)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Debe ser un slug válido.")
        String slug,
        @NotBlank @Size(min = 3, max = 180) String title,
        @Size(min = 10, max = 600) String summary,
        String coverImage,
        @Pattern(regexp = "DRAFT|PUBLISHED|ARCHIVED") String status,
        Boolean featured,
        @Min(0) Integer displayOrder,
        @Size(max = 100) String category,
        @Size(max = 10000) String description,
        @Size(max = 50) String domainStatus,
        LocalDate startDate,
        LocalDate endDate,
        @Size(max = 30) String modality,
        @Size(max = 255) String organizer,
        @Size(max = 255) String institution,
        @Size(max = 20000) String body,
        @Size(max = 50) String value,
        @Size(max = 255) String beneficiaryArea,
        @Size(max = 10000) String proposalOrManagement,
        @Size(max = 10000) String result,
        @Size(max = 30) String progress,
        @Min(0) Integer capacity,
        @Size(max = 20) String registrationMode,
        @Size(max = 2000) String registrationUrl,
        @Size(max = 2000) String officialUrl,
        @Size(max = 2000) String applicationUrl,
        @Size(max = 255) String role,
        @Size(max = 255) String area
) {
}
