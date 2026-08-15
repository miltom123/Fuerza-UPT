package pe.edu.upt.fuerzaupt.admin.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import pe.edu.upt.fuerzaupt.admin.service.CacheInvalidationPoller;

import pe.edu.upt.fuerzaupt.admin.dto.AdminStatusResponse;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStatusController {

    private final CacheInvalidationPoller cacheInvalidationPoller;

    @GetMapping("/status")
    public AdminStatusResponse status(Authentication authentication) {
        return new AdminStatusResponse(
                "ready",
                authentication.getName(),
                Instant.now(),
                cacheInvalidationPoller.lastSeenId()
        );
    }
}
