package pe.edu.upt.fuerzaupt.team.dto;

import pe.edu.upt.fuerzaupt.content.dto.TeamSocialLinkResponse;
import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TeamMemberAdminResponse(
        UUID id,
        String name,
        String role,
        String career,
        String description,
        TeamMemberCategory category,
        String location,
        String email,
        String notificationEmail,
        Boolean receiveApplications,
        MediaAssetResponse image,
        List<TeamSocialLinkResponse> socialLinks,
        String status,
        int displayOrder,
        Instant createdAt,
        Instant updatedAt,
        long version
) {
}
