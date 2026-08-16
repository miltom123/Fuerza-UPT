package pe.edu.upt.fuerzaupt.submission.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.submission.entity.NewsletterSubscription;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface NewsletterSubscriptionRepository extends JpaRepository<NewsletterSubscription, UUID> {
    Optional<NewsletterSubscription> findByEmailIgnoreCase(String email);
    Page<NewsletterSubscription> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    long countByStatus(String status);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant start, Instant end);
}
