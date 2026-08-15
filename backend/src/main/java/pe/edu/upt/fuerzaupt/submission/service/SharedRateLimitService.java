package pe.edu.upt.fuerzaupt.submission.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class SharedRateLimitService {

    private final RateLimitPersistenceService rateLimitPersistenceService;

    public void consume(String operation, String clientKey, int limit, Duration window) {
        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                rateLimitPersistenceService.consumeInNewTransaction(operation, clientKey, limit, window);
                return;
            } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException ex) {
                if (i == maxRetries - 1) {
                    throw ex;
                }
            }
        }
    }
}
