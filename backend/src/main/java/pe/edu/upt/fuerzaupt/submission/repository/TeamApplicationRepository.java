package pe.edu.upt.fuerzaupt.submission.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.submission.entity.TeamApplication;

import java.util.UUID;

public interface TeamApplicationRepository extends JpaRepository<TeamApplication, UUID> {
    Page<TeamApplication> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    long countByStatus(String status);
}
