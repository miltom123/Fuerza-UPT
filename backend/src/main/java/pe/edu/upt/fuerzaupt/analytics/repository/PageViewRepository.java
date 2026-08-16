package pe.edu.upt.fuerzaupt.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.analytics.entity.PageView;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PageViewRepository extends JpaRepository<PageView, UUID> {

    @Query("SELECT COUNT(p) FROM PageView p WHERE p.createdAt >= :start AND p.createdAt < :end")
    long countBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(DISTINCT p.visitorHash) FROM PageView p WHERE p.createdAt >= :start AND p.createdAt < :end")
    long countDistinctVisitorsBetween(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT p FROM PageView p WHERE p.createdAt >= :start AND p.createdAt < :end ORDER BY p.createdAt ASC")
    List<PageView> findBetween(@Param("start") Instant start, @Param("end") Instant end);
}
