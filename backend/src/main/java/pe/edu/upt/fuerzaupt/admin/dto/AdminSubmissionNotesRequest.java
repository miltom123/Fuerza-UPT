package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Size;

public record AdminSubmissionNotesRequest(
        @Size(max = 5000) String notes
) {
}
