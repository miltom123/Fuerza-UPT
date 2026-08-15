package pe.edu.upt.fuerzaupt.representation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "representation_items")
@EntityListeners(AuditingEntityListener.class)
public class RepresentationItem {
    @Id
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true, length = 180)
    private String slug;

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "summary", length = 600)
    private String summary;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "content_status", nullable = false, length = 30)
    private String contentStatus;

    @Column(name = "featured", nullable = false)
    private Boolean featured = false;

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

    @Column(name = "kind", nullable = false, length = 50)
    private String kind;

    @Column(name = "progress", nullable = false, length = 30)
    private String progress = "PRESENTADO";

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "impact_level", length = 20)
    private String impactLevel;

    @Column(name = "beneficiary_area", length = 255)
    private String beneficiaryArea;

    @Column(name = "identified_problem", columnDefinition = "TEXT")
    private String identifiedProblem;

    @Column(name = "proposal_or_management", columnDefinition = "TEXT")
    private String proposalOrManagement;

    @Column(name = "result", columnDefinition = "TEXT")
    private String result;

    @Column(name = "last_update")
    private Instant lastUpdate;

    @Column(name = "related_project_id")
    private UUID relatedProjectId;

    @Column(name = "related_event_id")
    private UUID relatedEventId;

    @Column(name = "related_opportunity_id")
    private UUID relatedOpportunityId;

    @OneToMany(mappedBy = "representation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<RepresentationAction> actions = new ArrayList<>();

    @OneToMany(mappedBy = "representation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<RepresentationEvidence> evidence = new ArrayList<>();
}
