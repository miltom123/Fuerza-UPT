package pe.edu.upt.fuerzaupt.security.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.auth.repository.LoginAttemptRepository;
import pe.edu.upt.fuerzaupt.submission.repository.RequestRateLimitRepository;

import java.time.Duration;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityCleanupJob {

    private final LoginAttemptRepository loginAttemptRepository;
    private final RequestRateLimitRepository requestRateLimitRepository;

    @Scheduled(cron = "${app.security.cleanup-cron:0 15 * * * *}")
    @Transactional
    public void cleanup() {
        try {
            Instant cutoff = Instant.now().minus(Duration.ofHours(24));

            int deletedAttempts = loginAttemptRepository.deleteExpired(cutoff);
            int deletedRateLimits = requestRateLimitRepository.deleteExpired(cutoff);

            if (deletedAttempts > 0 || deletedRateLimits > 0) {
                log.info("Security rate limiting state purged via JPA: {} login attempts, {} rate limits cleaned up.",
                        deletedAttempts, deletedRateLimits);
            }
        } catch (Exception ex) {
            log.error("Failed to execute security cleanup job: {}", ex.getMessage());
        }
    }
}
