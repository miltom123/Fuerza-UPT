package pe.edu.upt.fuerzaupt.representation.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationItem;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepresentationRepository extends JpaRepository<RepresentationItem, UUID> {

    @Query("SELECT r FROM RepresentationItem r WHERE r.contentStatus = 'PUBLISHED' " +
            "AND (:progress IS NULL OR r.progress = :progress) " +
            "AND (:featured IS NULL OR r.featured = :featured) " +
            "AND (:cursor IS NULL OR r.displayOrder > :cursor) " +
            "ORDER BY r.displayOrder ASC, r.publishedAt DESC")
    List<RepresentationItem> findPublicContent(
            @Param("progress") String progress,
            @Param("featured") Boolean featured,
            @Param("cursor") Integer cursor,
            Pageable pageable);

    @Query("SELECT r FROM RepresentationItem r WHERE r.contentStatus = 'PUBLISHED' AND r.slug = :slug")
    Optional<RepresentationItem> findBySlugAndPublished(@Param("slug") String slug);

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);

    @Query("SELECT r FROM RepresentationItem r WHERE (:status IS NULL OR r.contentStatus = :status) AND (:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(r.slug) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<RepresentationItem> searchAdminContent(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
