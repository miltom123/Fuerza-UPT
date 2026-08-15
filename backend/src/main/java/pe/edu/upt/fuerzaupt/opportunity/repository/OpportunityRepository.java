package pe.edu.upt.fuerzaupt.opportunity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.opportunity.entity.Opportunity;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OpportunityRepository extends JpaRepository<Opportunity, UUID> {

    @Query("SELECT o FROM Opportunity o WHERE o.contentStatus = 'PUBLISHED' " +
            "AND (:opportunityType IS NULL OR o.opportunityType = :opportunityType) " +
            "AND (:featured IS NULL OR o.featured = :featured) " +
            "AND (:cursor IS NULL OR o.displayOrder > :cursor) " +
            "ORDER BY o.displayOrder ASC, o.publishedAt DESC")
    List<Opportunity> findPublicContent(
            @Param("opportunityType") String opportunityType,
            @Param("featured") Boolean featured,
            @Param("cursor") Integer cursor,
            Pageable pageable);

    @Query("SELECT o FROM Opportunity o WHERE o.contentStatus = 'PUBLISHED' AND o.slug = :slug")
    Optional<Opportunity> findBySlugAndPublished(@Param("slug") String slug);

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);

    @Query("SELECT o FROM Opportunity o WHERE (:status IS NULL OR o.contentStatus = :status) AND (:search IS NULL OR LOWER(o.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(o.slug) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Opportunity> searchAdminContent(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
