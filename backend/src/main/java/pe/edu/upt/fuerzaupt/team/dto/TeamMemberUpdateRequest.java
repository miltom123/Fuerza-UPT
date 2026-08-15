package pe.edu.upt.fuerzaupt.team.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TeamMemberUpdateRequest(
        @NotBlank @Size(min = 3, max = 255) String name,
        @NotBlank @Size(min = 2, max = 255) String role,
        @NotBlank @Size(min = 2, max = 255) String career,
        @NotBlank @Size(min = 10, max = 2000) String description,
        @NotNull TeamMemberCategory category,
        @Size(max = 255) String location,
        @Email @Size(max = 255) String email,
        @Email @Size(max = 255) String notificationEmail,
        Boolean receiveApplications,
        @Size(max = 2000) String instagramUrl,
        @Size(max = 2000) String linkedinUrl,
        @Size(max = 2000) String facebookUrl,
        @Size(max = 2000) String twitterUrl,
        @NotBlank @Pattern(regexp = "DRAFT|PUBLISHED|ARCHIVED") String status,
        @NotNull @Min(0) Long version
) {
}
