package pe.edu.upt.fuerzaupt.poll.dto;

public record PollAdminDetailResponse(
        PollDetailResponse detail,
        long responseCount
) {
}
