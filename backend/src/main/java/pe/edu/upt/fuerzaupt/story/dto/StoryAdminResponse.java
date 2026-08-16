package pe.edu.upt.fuerzaupt.story.dto;

import java.time.Instant;
import java.util.UUID;

public record StoryAdminResponse(
        UUID id,
        String slug,
        String authorName,
        String authorCareer,
        String category,
        String quote,
        String fullStory,
        String imageUrl,
        String videoUrl,
        boolean featuredInHero,
        String contentStatus,
        int displayOrder,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt,
        long version
) {
}
