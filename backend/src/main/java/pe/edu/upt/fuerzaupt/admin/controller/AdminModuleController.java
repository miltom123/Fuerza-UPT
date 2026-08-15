package pe.edu.upt.fuerzaupt.admin.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentRowResponse;
import pe.edu.upt.fuerzaupt.admin.dto.AdminContentUpdateRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminEditorialStatusRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminFeaturedRequest;
import pe.edu.upt.fuerzaupt.admin.dto.AdminOrderRequest;
import pe.edu.upt.fuerzaupt.admin.service.AdminContentService;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/{module:representacion|eventos|estadisticas}")
@RequiredArgsConstructor
public class AdminModuleController {

    private final AdminContentService contentService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<AdminContentRowResponse> list(
            @PathVariable String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return contentService.list(module, page, size, search, status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminContentRowResponse create(
            @PathVariable String module,
            @Valid @RequestBody AdminContentRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        AdminContentRowResponse created = contentService.create(module, input);
        auditLogService.record(authentication, "CREATE", canonical, created.id(), null, created, request);
        cacheInvalidationService.invalidate(canonical);
        return created;
    }

    @GetMapping("/{id}")
    public AdminContentRowResponse find(@PathVariable String module, @PathVariable UUID id) {
        return contentService.find(module, id);
    }

    @PutMapping("/{id}")
    public AdminContentRowResponse update(
            @PathVariable String module,
            @PathVariable UUID id,
            @Valid @RequestBody AdminContentUpdateRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        AdminContentRowResponse before = contentService.find(module, id);
        AdminContentRowResponse updated = contentService.update(module, id, input);
        auditLogService.record(authentication, actionFor(before.status(), updated.status()), canonical, id,
                before, updated, request);
        cacheInvalidationService.invalidate(canonical);
        return updated;
    }

    @PatchMapping("/{id}/estado-editorial")
    public AdminContentRowResponse changeStatus(
            @PathVariable String module,
            @PathVariable UUID id,
            @Valid @RequestBody AdminEditorialStatusRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        AdminContentRowResponse before = contentService.find(module, id);
        AdminContentRowResponse updated = contentService.changeStatus(module, id, input.status(), input.version());
        auditLogService.record(authentication, actionFor(before.status(), updated.status()), canonical, id,
                before, updated, request);
        cacheInvalidationService.invalidate(canonical);
        return updated;
    }

    @PatchMapping("/{id}/destacado")
    public AdminContentRowResponse changeFeatured(
            @PathVariable String module,
            @PathVariable UUID id,
            @Valid @RequestBody AdminFeaturedRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        AdminContentRowResponse before = contentService.find(module, id);
        AdminContentRowResponse updated = contentService.changeFeatured(module, id, input.featured(), input.version());
        auditLogService.record(authentication, "UPDATE", canonical, id, before, updated, request);
        cacheInvalidationService.invalidate(canonical);
        return updated;
    }

    @PatchMapping("/orden")
    public List<AdminContentRowResponse> reorder(
            @PathVariable String module,
            @Valid @RequestBody AdminOrderRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        List<AdminContentRowResponse> before = input.items().stream()
                .map(item -> contentService.find(module, item.id()))
                .toList();
        List<AdminContentRowResponse> updated = contentService.reorder(module, input.items());
        for (int index = 0; index < updated.size(); index++) {
            auditLogService.record(authentication, "CHANGE_ORDER", canonical, updated.get(index).id(),
                    before.get(index), updated.get(index), request);
        }
        cacheInvalidationService.invalidate(canonical);
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(
            @PathVariable String module,
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String canonical = contentService.canonicalModule(module);
        AdminContentRowResponse before = contentService.archive(module, id);
        auditLogService.record(authentication, "ARCHIVE", canonical, id, before, null, request);
        cacheInvalidationService.invalidate(canonical);
    }

    private String actionFor(String before, String after) {
        if (before.equals(after)) return "UPDATE";
        if ("PUBLISHED".equals(after)) return "PUBLISH";
        if ("PUBLISHED".equals(before) && "DRAFT".equals(after)) return "UNPUBLISH";
        if ("ARCHIVED".equals(after)) return "ARCHIVE";
        if ("ARCHIVED".equals(before) && "DRAFT".equals(after)) return "RESTORE";
        return "UPDATE";
    }
}
