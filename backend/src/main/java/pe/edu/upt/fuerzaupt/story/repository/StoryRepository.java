package pe.edu.upt.fuerzaupt.story.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.story.entity.Story;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StoryRepository extends JpaRepository<Story, UUID> {

    @Query("SELECT s FROM Story s WHERE s.contentStatus = 'PUBLISHED' " +
            "AND (:category IS NULL OR s.category = :category) " +
            "ORDER BY s.displayOrder ASC, s.publishedAt DESC")
    List<Story> findPublicStories(@Param("category") String category, Pageable pageable);

    @Query("SELECT s FROM Story s WHERE s.contentStatus = 'PUBLISHED' AND s.featuredInHero = true " +
            "ORDER BY s.displayOrder ASC, s.publishedAt DESC")
    List<Story> findHeroStories();

    @Query("SELECT s FROM Story s WHERE s.contentStatus = 'PUBLISHED' AND s.slug = :slug")
    Optional<Story> findBySlugAndPublished(@Param("slug") String slug);

    long countByContentStatus(String contentStatus);

    @Query("SELECT s FROM Story s WHERE (:status IS NULL OR s.contentStatus = :status) " +
            "AND (:category IS NULL OR s.category = :category) " +
            "AND (:search IS NULL OR LOWER(s.authorName) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) " +
            "OR LOWER(s.authorCareer) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) " +
            "OR LOWER(s.quote) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Story> searchAdminStories(
            @Param("search") String search,
            @Param("status") String status,
            @Param("category") String category,
            Pageable pageable
    );
}
