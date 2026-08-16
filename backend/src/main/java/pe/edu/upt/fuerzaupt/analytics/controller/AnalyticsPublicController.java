package pe.edu.upt.fuerzaupt.analytics.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.analytics.dto.TrackVisitRequest;
import pe.edu.upt.fuerzaupt.analytics.service.AnalyticsService;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsPublicController {

    private final AnalyticsService analyticsService;
    private final ClientIpResolver clientIpResolver;

    @PostMapping("/track")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void trackVisit(
            @Valid @RequestBody TrackVisitRequest body,
            HttpServletRequest request
    ) {
        String ip = clientIpResolver.resolve(request);
        String userAgent = request.getHeader("User-Agent");
        analyticsService.trackVisit(body.path(), body.referrer(), ip, userAgent);
    }
}
