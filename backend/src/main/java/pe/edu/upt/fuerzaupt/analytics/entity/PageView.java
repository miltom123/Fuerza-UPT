package pe.edu.upt.fuerzaupt.analytics.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "analytics_page_views", indexes = {
        @Index(name = "idx_page_view_created_at", columnList = "created_at"),
        @Index(name = "idx_page_view_visitor_hash", columnList = "visitor_hash"),
        @Index(name = "idx_page_view_path", columnList = "path")
})
public class PageView {

    @Id
    private UUID id;

    @Column(name = "path", nullable = false, length = 500)
    private String path;

    @Column(name = "visitor_hash", nullable = false, length = 64)
    private String visitorHash;

    @Column(name = "referrer", length = 500)
    private String referrer;

    @Column(name = "user_agent", length = 300)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
