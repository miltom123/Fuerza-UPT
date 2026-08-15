package pe.edu.upt.fuerzaupt.project.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.project.entity.Project;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("SELECT p FROM Project p WHERE p.contentStatus = 'PUBLISHED' " +
            "AND (:projectStatus IS NULL OR p.projectStatus = :projectStatus) " +
            "AND (:featured IS NULL OR p.featured = :featured) " +
            "AND (:cursor IS NULL OR p.displayOrder > :cursor) " +
            "ORDER BY p.displayOrder ASC, p.publishedAt DESC")
    List<Project> findPublicContent(
            @Param("projectStatus") String projectStatus,
            @Param("featured") Boolean featured,
            @Param("cursor") Integer cursor,
            Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.contentStatus = 'PUBLISHED' AND (p.slug = :slug OR CAST(p.id AS string) = :slug)")
    Optional<Project> findBySlugAndPublished(@Param("slug") String slug);

    @Query("SELECT p FROM Project p WHERE p.contentStatus = 'PUBLISHED' ORDER BY p.displayOrder ASC, p.startDate DESC")
    List<Project> findPublishedProjects();

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);

    @Query("SELECT p FROM Project p WHERE (:status IS NULL OR p.contentStatus = :status) AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(p.slug) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Project> searchAdminContent(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
