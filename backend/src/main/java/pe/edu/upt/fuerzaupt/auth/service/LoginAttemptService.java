package pe.edu.upt.fuerzaupt.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.auth.entity.LoginAttempt;
import pe.edu.upt.fuerzaupt.auth.exception.TooManyLoginAttemptsException;
import pe.edu.upt.fuerzaupt.auth.repository.LoginAttemptRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int COMBINATION_MAX_ATTEMPTS = 5;
    private static final Duration COMBINATION_BLOCK_DURATION = Duration.ofMinutes(15);
    private static final Duration COMBINATION_WINDOW_DURATION = Duration.ofMinutes(15);

    private static final int ACCOUNT_MAX_ATTEMPTS = 10;
    private static final Duration ACCOUNT_BLOCK_DURATION = Duration.ofMinutes(30);
    private static final Duration ACCOUNT_WINDOW_DURATION = Duration.ofMinutes(30);

    private static final int IP_MAX_ATTEMPTS = 30;
    private static final Duration IP_BLOCK_DURATION = Duration.ofMinutes(15);
    private static final Duration IP_WINDOW_DURATION = Duration.ofMinutes(15);

    private final LoginAttemptRepository loginAttemptRepository;
    private final LoginAttemptPersistenceService loginAttemptPersistenceService;

    @Transactional(readOnly = true)
    public void ensureAllowed(String key) {
        ensureAllowedWithLimit(key);
    }

    @Transactional(readOnly = true)
    public void ensureAllowedMulti(String ipKey, String accountKey, String combinationKey) {
        ensureAllowedWithLimit(combinationKey);
        ensureAllowedWithLimit(accountKey);
        ensureAllowedWithLimit(ipKey);
    }

    private void ensureAllowedWithLimit(String key) {
        LoginAttempt attempt = loginAttemptRepository.findById(key).orElse(null);
        if (attempt != null && attempt.getBlockedUntil() != null && Instant.now().isBefore(attempt.getBlockedUntil())) {
            throw new TooManyLoginAttemptsException();
        }
    }

    public void recordFailure(String key) {
        recordFailureWithRetry(key, COMBINATION_MAX_ATTEMPTS, COMBINATION_BLOCK_DURATION, COMBINATION_WINDOW_DURATION);
    }

    public void recordFailureMulti(String ipKey, String accountKey, String combinationKey) {
        recordFailureWithRetry(combinationKey, COMBINATION_MAX_ATTEMPTS, COMBINATION_BLOCK_DURATION, COMBINATION_WINDOW_DURATION);
        recordFailureWithRetry(accountKey, ACCOUNT_MAX_ATTEMPTS, ACCOUNT_BLOCK_DURATION, ACCOUNT_WINDOW_DURATION);
        recordFailureWithRetry(ipKey, IP_MAX_ATTEMPTS, IP_BLOCK_DURATION, IP_WINDOW_DURATION);
    }

    private void recordFailureWithRetry(String key, int maxAttempts, Duration blockDuration, Duration windowDuration) {
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                loginAttemptPersistenceService.recordFailureInNewTransaction(key, maxAttempts, blockDuration, windowDuration);
                return;
            } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException ex) {
                if (i == maxRetries - 1) {
                    throw ex;
                }
            }
        }
    }

    @Transactional
    public void recordSuccess(String key) {
        loginAttemptRepository.deleteById(key);
    }

    @Transactional
    public void recordSuccessMulti(String ipKey, String accountKey, String combinationKey) {
        loginAttemptRepository.deleteAllByKeys(List.of(ipKey, accountKey, combinationKey));
    }
}
