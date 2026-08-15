package pe.edu.upt.fuerzaupt.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.auth.entity.LoginAttempt;
import pe.edu.upt.fuerzaupt.auth.repository.LoginAttemptRepository;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LoginAttemptPersistenceService {

    private final LoginAttemptRepository loginAttemptRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailureInNewTransaction(String key, int maxAttempts, Duration blockDuration, Duration windowDuration) {
        Instant now = Instant.now();
        LoginAttempt attempt = loginAttemptRepository.findForUpdate(key)
                .orElseGet(() -> new LoginAttempt(key, 0, null));

        boolean windowExpired = attempt.getWindowStartedAt() == null ||
                Duration.between(attempt.getWindowStartedAt(), now).compareTo(windowDuration) >= 0;

        int failures;
        if (windowExpired || (attempt.getBlockedUntil() != null && attempt.getBlockedUntil().isBefore(now))) {
            failures = 1;
            attempt.setWindowStartedAt(now);
        } else {
            failures = attempt.getFailures() + 1;
        }

        Instant blockedUntil = failures >= maxAttempts ? now.plus(blockDuration) : null;

        attempt.setFailures(failures);
        attempt.setBlockedUntil(blockedUntil);
        loginAttemptRepository.saveAndFlush(attempt);
    }
}
