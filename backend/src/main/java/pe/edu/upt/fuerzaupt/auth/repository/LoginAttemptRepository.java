package pe.edu.upt.fuerzaupt.auth.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upt.fuerzaupt.auth.entity.LoginAttempt;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM LoginAttempt l WHERE l.attemptKey = :key")
    Optional<LoginAttempt> findForUpdate(@Param("key") String key);

    @Modifying
    @Query("DELETE FROM LoginAttempt l WHERE l.attemptKey IN :keys")
    int deleteAllByKeys(@Param("keys") Collection<String> keys);

    @Modifying
    @Query("DELETE FROM LoginAttempt l WHERE l.updatedAt < :cutoff")
    int deleteExpired(@Param("cutoff") Instant cutoff);
}
