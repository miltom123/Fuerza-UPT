package pe.edu.upt.fuerzaupt.story.controller;

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
import pe.edu.upt.fuerzaupt.story.dto.StoryAdminRequest;
import pe.edu.upt.fuerzaupt.story.dto.StoryAdminResponse;
import pe.edu.upt.fuerzaupt.story.service.StoryAdminService;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/historias")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StoryAdminController {

    private final StoryAdminService storyAdminService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<StoryAdminResponse> getStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category
    ) {
        return storyAdminService.searchStories(page, size, search, status, category);
    }

    @GetMapping("/{id}")
    public StoryAdminResponse getStoryById(@PathVariable UUID id) {
        return storyAdminService.getStoryById(id);
    }

    @PostMapping
    public ResponseEntity<StoryAdminResponse> createStory(
            @Valid @RequestBody StoryAdminRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        StoryAdminResponse created = storyAdminService.createStory(request);
        auditLogService.record(authentication, "CREATE", "stories", created.id(), null, created, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public StoryAdminResponse updateStory(
            @PathVariable UUID id,
            @Valid @RequestBody StoryAdminRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        StoryAdminResponse before = storyAdminService.getStoryById(id);
        StoryAdminResponse updated = storyAdminService.updateStory(id, request);
        auditLogService.record(authentication, "UPDATE", "stories", id, before, updated, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return updated;
    }

    @PatchMapping("/{id}/estado")
    public StoryAdminResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) Long version,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        StoryAdminResponse before = storyAdminService.getStoryById(id);
        StoryAdminResponse updated = storyAdminService.updateStatus(id, status, version);
        auditLogService.record(authentication, "UPDATE_STATUS", "stories", id, before, updated, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiveStory(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        StoryAdminResponse before = storyAdminService.getStoryById(id);
        StoryAdminResponse archived = storyAdminService.archiveStory(id);
        auditLogService.record(authentication, "ARCHIVE", "stories", id, before, archived, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<Void> deleteStory(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean confirm,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        StoryAdminResponse before = storyAdminService.getStoryById(id);
        StoryAdminResponse deleted = storyAdminService.deleteStory(id, confirm);
        auditLogService.record(authentication, "DELETE_PERMANENT", "stories", id, before, deleted, servletRequest);
        cacheInvalidationService.invalidate("representation");
        return ResponseEntity.noContent().build();
    }
}
