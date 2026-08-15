package pe.edu.upt.fuerzaupt.poll.dto;

import java.util.List;
import java.util.UUID;

public record PollResultsResponse(
        UUID pollId,
        String title,
        long totalResponses,
        List<QuestionResult> questions
) {
    public record QuestionResult(
            UUID questionId,
            String questionText,
            String questionType,
            long totalAnswers,
            Double averageRating,
            List<OptionResult> options,
            List<String> textAnswers
    ) {
    }

    public record OptionResult(
            UUID optionId,
            String label,
            long votes,
            double percentage
    ) {
    }
}
