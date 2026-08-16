package pe.edu.upt.fuerzaupt.story.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "stories")
@EntityListeners(AuditingEntityListener.class)
public class Story {

    @Id
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true, length = 180)
    private String slug;

    @Column(name = "author_name", nullable = false, length = 180)
    private String authorName;

    @Column(name = "author_career", nullable = false, length = 180)
    private String authorCareer;

    @Column(name = "category", nullable = false, length = 100)
    private String category = "Experiencia";

    @Column(name = "quote", nullable = false, columnDefinition = "TEXT")
    private String quote;

    @Column(name = "full_story", columnDefinition = "TEXT")
    private String fullStory;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "video_url", columnDefinition = "TEXT")
    private String videoUrl;

    @Column(name = "featured_in_hero", nullable = false)
    private Boolean featuredInHero = false;

    @Column(name = "content_status", nullable = false, length = 30)
    private String contentStatus = "DRAFT";

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "published_at")
    private Instant publishedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
}
