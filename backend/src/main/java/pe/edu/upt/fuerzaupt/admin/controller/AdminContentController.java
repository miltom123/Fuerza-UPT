package pe.edu.upt.fuerzaupt.admin.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
import pe.edu.upt.fuerzaupt.admin.dto.AdminModuleSummaryResponse;
import pe.edu.upt.fuerzaupt.admin.service.AdminContentService;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
public class AdminContentController {

    private final AdminContentService contentService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public List<AdminModuleSummaryResponse> summaries() {
        return contentService.summaries();
    }

    @GetMapping("/{module}")
    public PageResponse<AdminContentRowResponse> list(
            @PathVariable String module,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return contentService.list(module, page, size);
    }

    @PostMapping("/{module}")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminContentRowResponse create(
            @PathVariable String module,
            @Valid @RequestBody AdminContentRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        AdminContentRowResponse created = contentService.create(module, input);
        auditLogService.record(authentication, "CREATE", module, created.id(), null, created, request);
        cacheInvalidationService.invalidate(module);
        return created;
    }

    @PutMapping("/{module}/{id}")
    public AdminContentRowResponse update(
            @PathVariable String module,
            @PathVariable UUID id,
            @Valid @RequestBody AdminContentUpdateRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        AdminContentRowResponse before = contentService.find(module, id);
        AdminContentRowResponse updated = contentService.update(module, id, input);
        auditLogService.record(authentication, "UPDATE", module, id, before, updated, request);
        cacheInvalidationService.invalidate(module);
        return updated;
    }

    @DeleteMapping("/{module}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(
            @PathVariable String module,
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        AdminContentRowResponse before = contentService.archive(module, id);
        auditLogService.record(authentication, "ARCHIVE", module, id, before, null, request);
        cacheInvalidationService.invalidate(module);
    }
}
