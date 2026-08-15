package pe.edu.upt.fuerzaupt.event.repository;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.event.entity.Event;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("SELECT e FROM Event e WHERE e.contentStatus = 'PUBLISHED' " +
            "AND (:modality IS NULL OR e.modality = :modality) " +
            "AND (:featured IS NULL OR e.featured = :featured) " +
            "AND (:cursor IS NULL OR e.displayOrder > :cursor) " +
            "ORDER BY e.displayOrder ASC, e.publishedAt DESC")
    List<Event> findPublicContent(
            @Param("modality") String modality,
            @Param("featured") Boolean featured,
            @Param("cursor") Integer cursor,
            Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.contentStatus = 'PUBLISHED' AND e.slug = :slug")
    Optional<Event> findBySlugAndPublished(@Param("slug") String slug);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")})
    @Query("SELECT e FROM Event e WHERE e.id = :id AND e.contentStatus = 'PUBLISHED'")
    Optional<Event> findPublishedByIdForUpdate(@Param("id") UUID id);

    List<Event> findByProjectId(UUID projectId);

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);

    @Query("SELECT e FROM Event e WHERE ((:status IS NULL AND e.contentStatus IN ('DRAFT', 'PUBLISHED')) OR e.contentStatus = :status) AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(e.slug) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Event> searchAdminContent(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
