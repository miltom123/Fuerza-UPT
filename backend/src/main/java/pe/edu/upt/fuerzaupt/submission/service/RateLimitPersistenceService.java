package pe.edu.upt.fuerzaupt.submission.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.common.exception.RateLimitExceededException;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimit;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimitId;
import pe.edu.upt.fuerzaupt.submission.repository.RequestRateLimitRepository;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RateLimitPersistenceService {

    private final RequestRateLimitRepository requestRateLimitRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void consumeInNewTransaction(String operation, String clientKey, int limit, Duration window) {
        RequestRateLimitId rateLimitId = new RequestRateLimitId(operation, clientKey);
        Instant now = Instant.now();
        Instant windowStartCutoff = now.minus(window);

        RequestRateLimit record = requestRateLimitRepository.findForUpdate(rateLimitId)
                .orElseGet(() -> new RequestRateLimit(rateLimitId, now, 0));

        if (record.getWindowStartedAt() == null || record.getWindowStartedAt().isBefore(windowStartCutoff)) {
            record.setWindowStartedAt(now);
            record.setRequestCount(1);
        } else {
            record.setRequestCount(record.getRequestCount() + 1);
        }

        requestRateLimitRepository.saveAndFlush(record);

        if (record.getRequestCount() > limit) {
            throw new RateLimitExceededException();
        }
    }
}
