package pe.edu.upt.fuerzaupt.poll.dto;

import java.util.List;
import java.util.UUID;

public record PollDetailResponse(
        PollSummaryResponse poll,
        List<Question> questions
) {
    public record Question(
            UUID id,
            String questionText,
            String questionType,
            boolean required,
            int displayOrder,
            List<Option> options
    ) {
    }

    public record Option(
            UUID id,
            String label,
            int displayOrder
    ) {
    }
}
