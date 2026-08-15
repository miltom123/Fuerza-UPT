package pe.edu.upt.fuerzaupt.statistic.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.statistic.entity.Statistic;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface StatisticRepository extends JpaRepository<Statistic, UUID> {
    List<Statistic> findByContentStatusOrderByDisplayOrderAsc(String contentStatus);

    @Query("SELECT s FROM Statistic s WHERE s.contentStatus = 'PUBLISHED' ORDER BY s.displayOrder ASC")
    List<Statistic> findVerifiedStatistics(Pageable pageable);

    long countByContentStatus(String contentStatus);

    long countByContentStatusIn(Collection<String> contentStatuses);

    @Query("SELECT s FROM Statistic s WHERE (:status IS NULL OR s.contentStatus = :status) AND (:search IS NULL OR LOWER(s.label) LIKE LOWER(CONCAT('%', cast(:search as string), '%')) OR LOWER(s.statKey) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))")
    Page<Statistic> searchAdminContent(@Param("search") String search, @Param("status") String status, Pageable pageable);
}
