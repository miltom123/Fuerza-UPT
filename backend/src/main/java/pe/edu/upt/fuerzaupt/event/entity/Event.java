package pe.edu.upt.fuerzaupt.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import pe.edu.upt.fuerzaupt.event.model.RegistrationMode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "events")
@EntityListeners(AuditingEntityListener.class)
public class Event {
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

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "event_time", length = 50)
    private String eventTime;

    @Column(name = "modality", nullable = false, length = 30)
    private String modality;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "organizer", length = 255)
    private String organizer;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_mode", nullable = false, length = 20)
    private RegistrationMode registrationMode = RegistrationMode.NONE;

    @Column(name = "registration_enabled", nullable = false)
    private Boolean registrationEnabled = false;

    @Column(name = "registration_url", columnDefinition = "TEXT")
    private String registrationUrl;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "event_status", nullable = false, length = 30)
    private String eventStatus;

    @Column(name = "project_id")
    private UUID projectId;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<EventSpeaker> speakers = new ArrayList<>();
}
