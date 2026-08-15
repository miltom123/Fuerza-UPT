package pe.edu.upt.fuerzaupt.team.controller;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.web.PageResponse;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberAdminResponse;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberCreateRequest;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberOrderRequest;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberStatusRequest;
import pe.edu.upt.fuerzaupt.team.dto.TeamMemberUpdateRequest;
import pe.edu.upt.fuerzaupt.team.service.TeamMemberService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/equipo")
@RequiredArgsConstructor
public class AdminTeamMemberController {

    private final TeamMemberService teamMemberService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping
    public PageResponse<TeamMemberAdminResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return teamMemberService.list(page, size, search, status);
    }

    @GetMapping("/{id}")
    public TeamMemberAdminResponse get(@PathVariable UUID id) {
        return teamMemberService.get(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMemberAdminResponse create(
            @Valid @RequestPart("data") TeamMemberCreateRequest input,
            @RequestPart("image") MultipartFile image,
            Authentication authentication,
            HttpServletRequest request
    ) {
        TeamMemberAdminResponse created = teamMemberService.create(input, image, authentication);
        auditLogService.record(authentication, "TEAM_MEMBER_CREATED", "team", created.id(), null, created, request);
        auditLogService.record(authentication, "TEAM_MEMBER_IMAGE_CHANGED", "team", created.id(), null,
                created.image(), request);
        invalidate();
        return created;
    }

    @PutMapping(path = "/{id}", consumes = "multipart/form-data")
    public TeamMemberAdminResponse update(
            @PathVariable UUID id,
            @Valid @RequestPart("data") TeamMemberUpdateRequest input,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam(defaultValue = "false") boolean removeImage,
            Authentication authentication,
            HttpServletRequest request
    ) {
        TeamMemberAdminResponse before = teamMemberService.get(id);
        TeamMemberAdminResponse updated = teamMemberService.update(id, input, image, removeImage, authentication);
        auditLogService.record(authentication, "TEAM_MEMBER_UPDATED", "team", id, before, updated, request);
        if (!sameImage(before, updated)) {
            auditLogService.record(authentication, "TEAM_MEMBER_IMAGE_CHANGED", "team", id,
                    before.image(), updated.image(), request);
        }
        invalidate();
        return updated;
    }

    @PatchMapping("/{id}/estado-editorial")
    public TeamMemberAdminResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TeamMemberStatusRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        TeamMemberAdminResponse before = teamMemberService.get(id);
        TeamMemberAdminResponse updated = teamMemberService.changeStatus(id, input.status(), input.version());
        auditLogService.record(authentication, statusAction(before.status(), updated.status()), "team", id,
                before, updated, request);
        invalidate();
        return updated;
    }

    @PatchMapping("/orden")
    public List<TeamMemberAdminResponse> reorder(
            @Valid @RequestBody TeamMemberOrderRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        List<TeamMemberAdminResponse> before = teamMemberService.list(0, 100, null, null).getContent();
        List<TeamMemberAdminResponse> updated = teamMemberService.reorder(input);
        auditLogService.record(authentication, "TEAM_MEMBER_UPDATED", "team", updated.get(0).id(), before, updated, request);
        invalidate();
        return updated;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        TeamMemberAdminResponse before = teamMemberService.get(id);
        TeamMemberAdminResponse archived = teamMemberService.archive(id);
        auditLogService.record(authentication, "TEAM_MEMBER_ARCHIVED", "team", id, before, archived, request);
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
        TeamMemberAdminResponse deleted = teamMemberService.permanentlyDelete(id);
        auditLogService.record(authentication, "TEAM_MEMBER_PERMANENTLY_DELETED", "team", id,
                deleted, null, request);
        invalidate();
    }

    private String statusAction(String before, String after) {
        if ("PUBLISHED".equals(after)) return "TEAM_MEMBER_PUBLISHED";
        if ("PUBLISHED".equals(before) && "DRAFT".equals(after)) return "TEAM_MEMBER_UNPUBLISHED";
        if ("ARCHIVED".equals(before) && "DRAFT".equals(after)) return "TEAM_MEMBER_RESTORED";
        if ("ARCHIVED".equals(after)) return "TEAM_MEMBER_ARCHIVED";
        return "TEAM_MEMBER_UPDATED";
    }

    private boolean sameImage(TeamMemberAdminResponse before, TeamMemberAdminResponse after) {
        UUID beforeId = before.image() == null ? null : before.image().id();
        UUID afterId = after.image() == null ? null : after.image().id();
        return java.util.Objects.equals(beforeId, afterId);
    }

    private void invalidate() {
        cacheInvalidationService.invalidate("team");
    }
}
