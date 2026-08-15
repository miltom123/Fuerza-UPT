package pe.edu.upt.fuerzaupt.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "login_attempts")
@Getter
@Setter
@NoArgsConstructor
public class LoginAttempt {

    @Id
    @Column(name = "attempt_key", length = 320, nullable = false)
    private String attemptKey;

    @Column(name = "failures", nullable = false)
    private int failures;

    @Column(name = "window_started_at", nullable = false)
    private Instant windowStartedAt = Instant.now();

    @Column(name = "blocked_until")
    private Instant blockedUntil;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public LoginAttempt(String attemptKey, int failures, Instant blockedUntil) {
        this.attemptKey = attemptKey;
        this.failures = failures;
        this.windowStartedAt = Instant.now();
        this.blockedUntil = blockedUntil;
        this.updatedAt = Instant.now();
    }

    @PrePersist
    @PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }
}
