package pe.edu.upt.fuerzaupt.poll.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.poll.dto.PollDetailResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollResultsResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollSubmissionRequest;
import pe.edu.upt.fuerzaupt.poll.dto.PollSubmissionResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollSummaryResponse;
import pe.edu.upt.fuerzaupt.poll.service.PollService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PublicPollController {

    private final PollService pollService;

    @GetMapping("/api/encuestas/activas")
    public List<PollSummaryResponse> active() {
        return pollService.active();
    }

    @GetMapping("/api/encuestas/{slug}")
    public PollDetailResponse detail(@PathVariable String slug) {
        return pollService.publicDetail(slug);
    }

    @PostMapping("/api/encuestas/{id}/respuestas")
    @ResponseStatus(HttpStatus.CREATED)
    public PollSubmissionResponse submit(
            @PathVariable UUID id,
            @Valid @RequestBody PollSubmissionRequest input,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return pollService.submit(id, input, authentication, request, response);
    }

    @GetMapping("/api/encuestas/{id}/resultados")
    public PollResultsResponse results(@PathVariable UUID id) {
        return pollService.publicResults(id);
    }
}
