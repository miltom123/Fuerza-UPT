package pe.edu.upt.fuerzaupt.submission.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimit;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimitId;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RequestRateLimitRepository extends JpaRepository<RequestRateLimit, RequestRateLimitId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RequestRateLimit r WHERE r.id = :id")
    Optional<RequestRateLimit> findForUpdate(@Param("id") RequestRateLimitId id);

    @Modifying
    @Query("DELETE FROM RequestRateLimit r WHERE r.windowStartedAt < :cutoff")
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
