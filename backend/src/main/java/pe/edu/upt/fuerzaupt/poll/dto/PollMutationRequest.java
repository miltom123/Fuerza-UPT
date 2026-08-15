package pe.edu.upt.fuerzaupt.poll.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PollMutationRequest(
        @NotBlank @Size(max = 180)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Debe ser un slug valido.")
        String slug,
        @NotBlank @Size(min = 3, max = 180) String title,
        @Size(max = 2000) String description,
        @NotBlank @Pattern(regexp = "DRAFT|SCHEDULED|OPEN|CLOSED|ARCHIVED") String status,
        Instant startAt,
        Instant endAt,
        @NotNull Boolean allowAnonymous,
        @NotNull Boolean showResults,
        @NotNull Boolean featured,
        @Size(max = 30) List<@Valid Question> questions,
        @Min(0) Long version
) {
    public record Question(
            UUID id,
            @NotBlank @Size(max = 600) String questionText,
            @NotBlank @Pattern(regexp = "SINGLE_CHOICE|MULTIPLE_CHOICE|RATING|SHORT_TEXT") String questionType,
            @NotNull Boolean required,
            @NotNull @Min(0) Integer displayOrder,
            @Size(max = 20) List<@Valid Option> options
    ) {
    }

    public record Option(
            UUID id,
            @NotBlank @Size(max = 255) String label,
            @NotNull @Min(0) Integer displayOrder
    ) {
    }
}
