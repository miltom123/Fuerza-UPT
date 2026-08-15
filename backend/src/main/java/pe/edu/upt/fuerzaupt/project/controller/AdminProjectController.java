package pe.edu.upt.fuerzaupt.project.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.project.dto.CreateProjectRequest;
import pe.edu.upt.fuerzaupt.project.dto.ProjectAdminResponse;
import pe.edu.upt.fuerzaupt.project.dto.ProjectOrderRequest;
import pe.edu.upt.fuerzaupt.project.dto.ProjectStatusRequest;
import pe.edu.upt.fuerzaupt.project.dto.UpdateProjectRequest;
import pe.edu.upt.fuerzaupt.project.service.ProjectAdminService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/proyectos")
@RequiredArgsConstructor
public class AdminProjectController {
    private final ProjectAdminService service;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<ProjectAdminResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return service.findAllAdmin(page, size, search, status);
    }

    @GetMapping("/{id}")
    public ProjectAdminResponse get(@PathVariable UUID id) {
        return service.findByIdAdmin(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectAdminResponse create(
            @Valid @RequestPart("data") CreateProjectRequest input,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication,
            HttpServletRequest request
    ) {
        ProjectAdminResponse created = service.create(input, image, authentication);
        auditLogService.record(authentication, "PROJECT_CREATED", "proyectos", created.id(), null, created, request);
        invalidate();
        return created;
    }

    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    public ProjectAdminResponse update(
            @PathVariable UUID id,
            @Valid @RequestPart("data") UpdateProjectRequest input,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(defaultValue = "false") boolean removeImage,
            Authentication authentication,
            HttpServletRequest request
    ) {
        ProjectAdminResponse before = service.findByIdAdmin(id);
        ProjectAdminResponse updated = service.update(id, input, image, removeImage, authentication);
        auditLogService.record(authentication, "PROJECT_UPDATED", "proyectos", id, before, updated, request);
        invalidate();
        return updated;
    }

    @PatchMapping("/{id}/estado-editorial")
    public ProjectAdminResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectStatusRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        ProjectAdminResponse before = service.findByIdAdmin(id);
        ProjectAdminResponse updated = service.changeStatus(id, input.status(), input.version());
        auditLogService.record(authentication, statusAction(before.contentStatus(), updated.contentStatus()), "proyectos", id,
                before, updated, request);
        invalidate();
        return updated;
    }

    @PatchMapping("/orden")
    public List<ProjectAdminResponse> reorder(
            @Valid @RequestBody ProjectOrderRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        List<ProjectAdminResponse> updated = service.reorder(input);
        if (!updated.isEmpty()) {
            auditLogService.record(authentication, "PROJECT_REORDERED", "proyectos", updated.get(0).id(), null, null, request);
            invalidate();
        }
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        ProjectAdminResponse before = service.findByIdAdmin(id);
        ProjectAdminResponse archived = service.archive(id);
        auditLogService.record(authentication, "PROJECT_ARCHIVED", "proyectos", id, before, archived, request);
        invalidate();
    }

    @DeleteMapping("/{id}/permanente")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void permanentlyDelete(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean confirm,
            Authentication authentication,
            HttpServletRequest request
    ) {
        if (!confirm) throw new BusinessException("La eliminación definitiva requiere confirmación explícita.");
        ProjectAdminResponse deleted = service.permanentlyDelete(id);
        auditLogService.record(authentication, "PROJECT_PERMANENTLY_DELETED", "proyectos", id,
                deleted, null, request);
        invalidate();
    }

    private String statusAction(String before, String after) {
        if ("PUBLISHED".equals(after)) return "PROJECT_PUBLISHED";
        if ("PUBLISHED".equals(before) && "DRAFT".equals(after)) return "PROJECT_UNPUBLISHED";
        if ("ARCHIVED".equals(before) && "DRAFT".equals(after)) return "PROJECT_RESTORED";
        if ("ARCHIVED".equals(after)) return "PROJECT_ARCHIVED";
        return "PROJECT_UPDATED";
    }

    private void invalidate() {
        cacheInvalidationService.invalidate("proyectos");
    }
}
