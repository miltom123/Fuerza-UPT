package pe.edu.upt.fuerzaupt.poll.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollAdminDetailResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollMutationRequest;
import pe.edu.upt.fuerzaupt.poll.dto.PollResultsResponse;
import pe.edu.upt.fuerzaupt.poll.dto.PollStatusRequest;
import pe.edu.upt.fuerzaupt.poll.dto.PollSummaryResponse;
import pe.edu.upt.fuerzaupt.poll.service.PollService;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/encuestas")
@RequiredArgsConstructor
public class AdminPollController {

    private final PollService pollService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<PollSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return pollService.adminList(page, size, search, status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PollAdminDetailResponse create(
            @Valid @RequestBody PollMutationRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        PollAdminDetailResponse created = pollService.create(input);
        UUID id = created.detail().poll().id();
        auditLogService.record(authentication, "CREATE", "polls", id, null, created, request);
        cacheInvalidationService.invalidate("polls");
        return created;
    }

    @GetMapping("/{id}")
    public PollAdminDetailResponse detail(@PathVariable UUID id) {
        return pollService.adminDetail(id);
    }

    @PutMapping("/{id}")
    public PollAdminDetailResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody PollMutationRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        PollAdminDetailResponse before = pollService.adminDetail(id);
        PollAdminDetailResponse updated = pollService.update(id, input);
        auditLogService.record(authentication, actionFor(before.detail().poll().status(), updated.detail().poll().status()),
                "polls", id, before, updated, request);
        cacheInvalidationService.invalidate("polls");
        return updated;
    }

    @PatchMapping("/{id}/estado")
    public PollAdminDetailResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PollStatusRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        PollAdminDetailResponse before = pollService.adminDetail(id);
        PollAdminDetailResponse updated = pollService.changeStatus(id, input.status(), input.version());
        auditLogService.record(authentication, actionFor(before.detail().poll().status(), updated.detail().poll().status()),
                "polls", id, before, updated, request);
        cacheInvalidationService.invalidate("polls");
        return updated;
    }

    @GetMapping("/{id}/resultados")
    public PollResultsResponse results(@PathVariable UUID id) {
        return pollService.adminResults(id);
    }

    @GetMapping("/{id}/exportar")
    public ResponseEntity<byte[]> export(@PathVariable UUID id) {
        byte[] csv = pollService.aggregateCsv(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.setContentDisposition(ContentDisposition.attachment().filename("resultados-encuesta.csv").build());
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        PollAdminDetailResponse before = pollService.adminDetail(id);
        PollAdminDetailResponse updated = pollService.archive(id);
        auditLogService.record(authentication, "ARCHIVE", "polls", id, before, updated, request);
        cacheInvalidationService.invalidate("polls");
    }

    private String actionFor(String before, String after) {
        if (before.equals(after)) return "UPDATE";
        if ("OPEN".equals(after)) return "PUBLISH";
        if ("CLOSED".equals(after)) return "CLOSE_POLL";
        if ("ARCHIVED".equals(after)) return "ARCHIVE";
        if ("ARCHIVED".equals(before) && "DRAFT".equals(after)) return "RESTORE";
        return "UPDATE";
    }
}
