package pe.edu.upt.fuerzaupt.team.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberCategory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "team_members")
@EntityListeners(AuditingEntityListener.class)
public class TeamMember {

    @Id
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "role")
    private String role;

    @Column(name = "career")
    private String career;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private TeamMemberCategory category;

    @Column(name = "location")
    private String location;

    @Column(name = "email")
    private String email;

    @Column(name = "notification_email")
    private String notificationEmail;

    @Column(name = "receive_applications", nullable = false)
    private Boolean receiveApplications = false;

    @Column(name = "image_media_id")
    private UUID imageMediaId;

    @Column(name = "content_status")
    private String contentStatus;

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

    @OneToMany(mappedBy = "teamMember", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<TeamSocialLink> socialLinks = new ArrayList<>();

    public void addSocialLink(TeamSocialLink link) {
        socialLinks.add(link);
        link.setTeamMember(this);
    }
}
