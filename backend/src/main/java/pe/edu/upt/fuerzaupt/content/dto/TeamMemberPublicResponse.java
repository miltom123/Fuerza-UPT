package pe.edu.upt.fuerzaupt.content.dto;

import java.util.List;
import java.util.UUID;

public record TeamMemberPublicResponse(
        UUID id,
        String name,
        String role,
        String career,
        String description,
        String location,
        String email,
        String imageUrl,
        List<TeamSocialLinkResponse> socialLinks
) {
}
