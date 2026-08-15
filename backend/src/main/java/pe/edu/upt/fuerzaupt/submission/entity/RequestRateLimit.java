package pe.edu.upt.fuerzaupt.submission.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "request_rate_limits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestRateLimit {

    @EmbeddedId
    private RequestRateLimitId id;

    @Column(name = "window_started_at", nullable = false)
    private Instant windowStartedAt;

    @Column(name = "request_count", nullable = false)
    private int requestCount;
}
