package pe.edu.upt.fuerzaupt.poll.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record PollSubmissionRequest(
        @NotEmpty @Size(max = 100) List<@Valid Answer> answers,
        Boolean consent
) {
    public record Answer(
            @NotNull UUID questionId,
            @Size(max = 20) List<UUID> optionIds,
            @Min(1) @Max(5) Integer ratingValue,
            @Size(max = 500) String textValue
    ) {
    }
}
