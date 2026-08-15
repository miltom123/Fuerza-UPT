package pe.edu.upt.fuerzaupt.settings.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationService;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsResponse;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsUpdateRequest;
import pe.edu.upt.fuerzaupt.settings.service.SiteSettingsService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SiteSettingsController {

    private static final UUID SETTINGS_AUDIT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private final SiteSettingsService settingsService;
    private final AuditLogService auditLogService;
    private final CacheInvalidationService cacheInvalidationService;

    @GetMapping("/api/configuracion-publica")
    public SiteSettingsResponse publicSettings() {
        return settingsService.publicSettings();
    }

    @GetMapping("/api/admin/configuracion")
    public SiteSettingsResponse adminSettings() {
        return settingsService.get();
    }

    @PutMapping("/api/admin/configuracion")
    public SiteSettingsResponse update(
            @Valid @RequestBody SiteSettingsUpdateRequest input,
            Authentication authentication,
            HttpServletRequest request
    ) {
        SiteSettingsResponse before = settingsService.get();
        SiteSettingsResponse updated = settingsService.update(input);
        auditLogService.record(authentication, "UPDATE", "site-settings", SETTINGS_AUDIT_ID,
                before, updated, request);
        cacheInvalidationService.invalidate("settings");
        return updated;
    }
}
