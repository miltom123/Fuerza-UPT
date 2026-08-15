package pe.edu.upt.fuerzaupt.poll.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upt.fuerzaupt.poll.entity.PollResponse;

import java.util.UUID;

public interface PollResponseRepository extends JpaRepository<PollResponse, UUID> {
    long countByPollId(UUID pollId);
    boolean existsByPollIdAndRespondentFingerprint(UUID pollId, String respondentFingerprint);
}
