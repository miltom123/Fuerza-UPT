package pe.edu.upt.fuerzaupt.admin.dto;

import jakarta.validation.constraints.Pattern;

public record AdminSubmissionStatusRequest(
        @Pattern(regexp = "NEW|IN_REVIEW|RESOLVED|REJECTED|SPAM") String status
) {
}
