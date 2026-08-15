package pe.edu.upt.fuerzaupt.media.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.media.dto.MediaAssetResponse;
import pe.edu.upt.fuerzaupt.media.service.SupabaseStorageService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final SupabaseStorageService storageService;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<MediaAssetResponse> list(@RequestParam(defaultValue = "50") int limit) {
        return storageService.list(limit);
    }

    @GetMapping("/{id}")
    public MediaAssetResponse get(@PathVariable UUID id) {
        return storageService.get(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetResponse upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean privateAsset,
            Authentication authentication,
            HttpServletRequest request
    ) {
        MediaAssetResponse uploaded = storageService.upload(file, privateAsset, authentication);
        auditLogService.record(authentication, "UPLOAD", "media", uploaded.id(), null, uploaded, request);
        return uploaded;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            Authentication authentication,
            HttpServletRequest request
    ) {
        MediaAssetResponse deleted = storageService.delete(id);
        auditLogService.record(authentication, "DELETE_MEDIA", "media", id, deleted, null, request);
    }
}
