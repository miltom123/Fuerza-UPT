package pe.edu.upt.fuerzaupt.security.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;
import pe.edu.upt.fuerzaupt.security.service.OAuthUserManagementService;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
public class GoogleOAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuthUserManagementService oAuthUserManagementService;
    private final SecurityContextRepository securityContextRepository;
    private final AuditLogService auditLogService;

    @Value("${app.frontend-origin:http://localhost:3000}")
    private String frontendOrigin;

    @Value("${app.oauth.success-path:/admin}")
    private String successPath;

    public GoogleOAuth2AuthenticationSuccessHandler(
            OAuthUserManagementService oAuthUserManagementService,
            @Lazy SecurityContextRepository securityContextRepository,
            AuditLogService auditLogService
    ) {
        this.oAuthUserManagementService = oAuthUserManagementService;
        this.securityContextRepository = securityContextRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            log.error("Authentication no es OAuth2AuthenticationToken: {}", authentication.getClass().getName());
            response.sendRedirect(buildTargetUrl(frontendOrigin, "/login?oauthError=invalid_token"));
            return;
        }

        OAuth2User oauthUser = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();

        try {
            CustomUserDetails principal = oAuthUserManagementService.processOAuthUser(oauthUser, provider);

            // Create local Authentication token
            Authentication localAuth = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
            );

            // Mitigate session fixation
            request.changeSessionId();

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(localAuth);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            auditLogService.record(
                    localAuth,
                    "LOGIN",
                    "users",
                    principal.getId(),
                    null,
                    Map.of("email", principal.getUsername(), "provider", provider.toUpperCase()),
                    request
            );

            boolean isAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));


            String targetPath = isAdmin ? (successPath.startsWith("/admin") ? "/administracion" : successPath) : "/unete#registro";
            String targetUrl = buildTargetUrl(frontendOrigin, targetPath);
            response.sendRedirect(targetUrl);
        } catch (Exception ex) {
            log.error("Fallo al procesar autenticación OAuth2 de Google: {}", ex.getMessage(), ex);
            response.sendRedirect(buildTargetUrl(frontendOrigin, "/unete?oauthError=true#registro"));
        }

    }

    private String buildTargetUrl(String origin, String path) {
        String cleanOrigin = origin.replaceAll("/+$", "");
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        return cleanOrigin + cleanPath;
    }
}
