package pe.edu.upt.fuerzaupt.submission.entity;

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
@Table(name = "student_proposals")
@EntityListeners(AuditingEntityListener.class)
public class StudentProposal {
    @Id
    private UUID id;

    @Column(name = "student_name", nullable = false, length = 255)
    private String studentName;

    @Column(name = "student_code", length = 50)
    private String studentCode;

    @Column(name = "career", length = 255)
    private String career;

    @Column(name = "proposal_text", nullable = false, columnDefinition = "TEXT")
    private String proposalText;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "NEW";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "user_agent", length = 512)
    private String userAgent;
}
