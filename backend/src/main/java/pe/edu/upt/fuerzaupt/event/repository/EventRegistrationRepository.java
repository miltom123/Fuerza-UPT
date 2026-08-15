package pe.edu.upt.fuerzaupt.event.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.event.entity.EventRegistration;

import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event.id = :eventId AND er.registrationStatus <> :status")
    int countByEventIdAndRegistrationStatusNot(@Param("eventId") UUID eventId, @Param("status") String status);

    boolean existsByEventIdAndEmailIgnoreCaseOrEventIdAndStudentCodeIgnoreCase(UUID eventId1, String email, UUID eventId2, String studentCode);

    Page<EventRegistration> findAllByStatusOrderByRegisteredAtDesc(String status, Pageable pageable);

    long countByStatus(String status);
}
