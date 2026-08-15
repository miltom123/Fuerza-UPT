package pe.edu.upt.fuerzaupt.poll.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.poll.entity.Poll;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PollRepository extends JpaRepository<Poll, UUID> {

    @Query("SELECT p FROM Poll p WHERE p.status = 'OPEN' AND (p.startAt IS NULL OR p.startAt <= CURRENT_TIMESTAMP) AND (p.endAt IS NULL OR p.endAt >= CURRENT_TIMESTAMP) ORDER BY p.featured DESC, p.startAt ASC NULLS FIRST, p.createdAt DESC")
    List<Poll> findActivePolls();

    @Query("SELECT p FROM Poll p WHERE p.slug = :slug AND p.status = 'OPEN' AND (p.startAt IS NULL OR p.startAt <= CURRENT_TIMESTAMP) AND (p.endAt IS NULL OR p.endAt >= CURRENT_TIMESTAMP)")
    Optional<Poll> findActiveBySlug(@Param("slug") String slug);

    @Query("SELECT p FROM Poll p WHERE (:status IS NULL OR p.status = :status) AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(p.slug) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Poll> searchPolls(@Param("search") String search, @Param("status") String status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.QueryHints({@jakarta.persistence.QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @Query("SELECT p FROM Poll p WHERE p.id = :id")
    Optional<Poll> findByIdForUpdate(@Param("id") UUID id);

    boolean existsBySlug(String slug);

    long countByStatus(String status);

    long countByStatusIn(Collection<String> statuses);
}
