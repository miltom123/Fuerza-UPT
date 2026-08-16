package pe.edu.upt.fuerzaupt.submission.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.submission.entity.StudentProposal;

import java.time.Instant;
import java.util.UUID;

public interface StudentProposalRepository extends JpaRepository<StudentProposal, UUID> {
    Page<StudentProposal> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    long countByStatus(String status);
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant start, Instant end);
}
