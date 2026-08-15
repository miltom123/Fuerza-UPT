package pe.edu.upt.fuerzaupt.submission.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.submission.entity.NewsletterSubscription;
import pe.edu.upt.fuerzaupt.submission.repository.NewsletterSubscriptionRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsletterPersistenceService {

    private final NewsletterSubscriptionRepository repository;

    public NewsletterSubscription subscribeWithRetry(String email, String ipHash, String userAgent) {
        String cleanEmail = email.trim().toLowerCase();
        int maxRetries = 3;

        for (int i = 0; i < maxRetries; i++) {
            try {
                return subscribeInNewTransaction(cleanEmail, ipHash, userAgent);
            } catch (DataIntegrityViolationException ex) {
                if (i == maxRetries - 1) {
                    return repository.findByEmailIgnoreCase(cleanEmail).orElseGet(() -> createAndSaveFallback(cleanEmail, ipHash, userAgent));
                }
            }
        }
        return repository.findByEmailIgnoreCase(cleanEmail).orElseGet(() -> createAndSaveFallback(cleanEmail, ipHash, userAgent));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NewsletterSubscription subscribeInNewTransaction(String cleanEmail, String ipHash, String userAgent) {
        NewsletterSubscription subscription = repository.findByEmailIgnoreCase(cleanEmail)
                .orElseGet(() -> {
                    NewsletterSubscription newSub = new NewsletterSubscription();
                    newSub.setId(UUID.randomUUID());
                    newSub.setEmail(cleanEmail);
                    newSub.setIsActive(true);
                    newSub.setStatus("NEW");
                    return newSub;
                });

        subscription.setIsActive(true);
        subscription.setIpHash(ipHash);
        subscription.setUserAgent(userAgent);
        return repository.saveAndFlush(subscription);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NewsletterSubscription createAndSaveFallback(String cleanEmail, String ipHash, String userAgent) {
        return repository.findByEmailIgnoreCase(cleanEmail).orElseGet(() -> {
            NewsletterSubscription fallback = new NewsletterSubscription();
            fallback.setId(UUID.randomUUID());
            fallback.setEmail(cleanEmail);
            fallback.setIsActive(true);
            fallback.setStatus("NEW");
            fallback.setIpHash(ipHash);
            fallback.setUserAgent(userAgent);
            return repository.saveAndFlush(fallback);
        });
    }
}
