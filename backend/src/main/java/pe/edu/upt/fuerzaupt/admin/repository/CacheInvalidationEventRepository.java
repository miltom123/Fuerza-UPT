package pe.edu.upt.fuerzaupt.admin.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.edu.upt.fuerzaupt.admin.entity.CacheInvalidationEvent;

import java.util.List;
import java.util.Optional;

public interface CacheInvalidationEventRepository extends JpaRepository<CacheInvalidationEvent, Long> {

    @Query("SELECT COALESCE(MAX(c.id), 0) FROM CacheInvalidationEvent c")
    Long findMaxId();

    List<CacheInvalidationEvent> findByIdGreaterThanOrderByIdAsc(Long lastSeenId, Pageable pageable);
}
