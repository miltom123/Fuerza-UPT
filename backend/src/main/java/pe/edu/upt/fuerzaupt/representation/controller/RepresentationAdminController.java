package pe.edu.upt.fuerzaupt.representation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminRequest;
import pe.edu.upt.fuerzaupt.representation.dto.RepresentationAdminResponse;
import pe.edu.upt.fuerzaupt.representation.service.RepresentationAdminService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/representacion-estudiantil")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class RepresentationAdminController {

    private final RepresentationAdminService representationAdminService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<RepresentationAdminResponse> getItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return representationAdminService.searchItems(page, size, search, status);
    }

    @GetMapping("/{id}")
    public RepresentationAdminResponse getItemById(@PathVariable UUID id) {
        return representationAdminService.getItemById(id);
    }

    @PostMapping
    public ResponseEntity<RepresentationAdminResponse> createItem(
            @Valid @RequestBody RepresentationAdminRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        RepresentationAdminResponse created = representationAdminService.createItem(request);
        auditLogService.record(authentication, "CREATE", "representation", created.id(), null, created, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public RepresentationAdminResponse updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody RepresentationAdminRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        RepresentationAdminResponse before = representationAdminService.getItemById(id);
        RepresentationAdminResponse updated = representationAdminService.updateItem(id, request);
        auditLogService.record(authentication, "UPDATE", "representation", id, before, updated, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return updated;
    }

    @PatchMapping("/{id}/estado")
    public RepresentationAdminResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Long version,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        RepresentationAdminResponse before = representationAdminService.getItemById(id);
        RepresentationAdminResponse updated = representationAdminService.updateStatus(id, status, version);
        auditLogService.record(authentication, "UPDATE_STATUS", "representation", id, before, updated, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveItem(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        RepresentationAdminResponse before = representationAdminService.getItemById(id);
        RepresentationAdminResponse archived = representationAdminService.archiveItem(id);
        auditLogService.record(authentication, "ARCHIVE", "representation", id, before, archived, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<Void> deleteItem(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean confirm,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        RepresentationAdminResponse before = representationAdminService.getItemById(id);
        RepresentationAdminResponse deleted = representationAdminService.deleteItem(id, confirm);
        auditLogService.record(authentication, "DELETE_PERMANENT", "representation", id, before, deleted, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.noContent().build();
    }
}
