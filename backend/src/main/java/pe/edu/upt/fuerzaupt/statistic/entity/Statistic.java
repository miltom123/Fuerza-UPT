package pe.edu.upt.fuerzaupt.statistic.entity;

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
@Table(name = "statistics")
@EntityListeners(AuditingEntityListener.class)
public class Statistic {
    @Id
    private UUID id;

    @Column(name = "stat_key", nullable = false, unique = true, length = 100)
    private String statKey;

    @Column(name = "value", nullable = false, length = 50)
    private String value;

    @Column(name = "label", nullable = false, length = 255)
    private String label;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "source", length = 255)
    private String source;

    @Column(name = "content_status", nullable = false, length = 30)
    private String contentStatus = "DRAFT";

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

    @Column(name = "published_at")
    private Instant publishedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
}
