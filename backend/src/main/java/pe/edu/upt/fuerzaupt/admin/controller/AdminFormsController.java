package pe.edu.upt.fuerzaupt.admin.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.admin.dto.AdminSubmissionNotesRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminSubmissionResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminSubmissionStatusRequest;
import pe.edu.upt.fuerzaupt.admin.service.AdminOperationsService;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/formularios")
@RequiredArgsConstructor
public class AdminFormsController {

    private final AdminOperationsService operationsService;
    private final AuditLogService auditLogService;

    @GetMapping("/{type:contactos|propuestas|postulaciones|suscripciones|inscripciones}")
    public PageResponse<AdminSubmissionResponse> list(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        return operationsService.submissions(type, page, size, status);
    }

    @PatchMapping("/{type}/{id}/estado")
    public AdminSubmissionResponse updateStatus(
            @PathVariable String type,
            @PathVariable UUID id,
            @Valid @RequestBody AdminSubmissionStatusRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        AdminSubmissionResponse before = operationsService.findSubmission(type, id);
        AdminSubmissionResponse updated = operationsService.updateStatus(type, id, input.status(), userId(authentication));
        auditLogService.record(authentication, "UPDATE", "form-" + type, id, before, updated, request);
        return updated;
    }

    @PatchMapping("/{type}/{id}/notas")
    public AdminSubmissionResponse updateNotes(
            @PathVariable String type,
            @PathVariable UUID id,
            @Valid @RequestBody AdminSubmissionNotesRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        AdminSubmissionResponse before = operationsService.findSubmission(type, id);
        AdminSubmissionResponse updated = operationsService.updateNotes(type, id, input.notes(), userId(authentication));
        auditLogService.record(authentication, "UPDATE", "form-" + type, id, before, updated, request);
        return updated;
    }

    private UUID userId(Authentication authentication) {
        return authentication.getPrincipal() instanceof CustomUserDetails principal ? principal.getId() : null;
    }
}
