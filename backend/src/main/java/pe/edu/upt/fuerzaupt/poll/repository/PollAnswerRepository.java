package pe.edu.upt.fuerzaupt.poll.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.upt.fuerzaupt.poll.entity.PollAnswer;

import java.util.List;
import java.util.UUID;

public interface PollAnswerRepository extends JpaRepository<PollAnswer, UUID> {

    @Query("SELECT a.question.id as questionId, COUNT(a.id) as total FROM PollAnswer a WHERE a.response.poll.id = :pollId GROUP BY a.question.id")
    List<QuestionTotalProjection> countAnswersByQuestion(@Param("pollId") UUID pollId);

    @Query("SELECT a.option.id as optionId, COUNT(a.id) as votes FROM PollAnswer a WHERE a.response.poll.id = :pollId AND a.option IS NOT NULL GROUP BY a.option.id")
    List<OptionVotesProjection> countVotesByOption(@Param("pollId") UUID pollId);

    @Query("SELECT a.question.id as questionId, AVG(CAST(a.ratingValue AS double)) as average FROM PollAnswer a WHERE a.response.poll.id = :pollId AND a.ratingValue IS NOT NULL GROUP BY a.question.id")
    List<QuestionAverageProjection> averageRatingByQuestion(@Param("pollId") UUID pollId);

    @Query("SELECT a.question.id as questionId, a.textValue as textValue FROM PollAnswer a WHERE a.response.poll.id = :pollId AND a.textValue IS NOT NULL ORDER BY a.response.submittedAt DESC")
    List<QuestionTextProjection> textAnswersByQuestion(@Param("pollId") UUID pollId);

    interface QuestionTotalProjection {
        UUID getQuestionId();
        Long getTotal();
    }

    interface OptionVotesProjection {
        UUID getOptionId();
        Long getVotes();
    }

    interface QuestionAverageProjection {
        UUID getQuestionId();
        Double getAverage();
    }

    interface QuestionTextProjection {
        UUID getQuestionId();
        String getTextValue();
    }
}
