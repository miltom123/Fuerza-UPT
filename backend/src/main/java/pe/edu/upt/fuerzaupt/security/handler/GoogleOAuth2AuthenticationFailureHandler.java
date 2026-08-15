package pe.edu.upt.fuerzaupt.security.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class GoogleOAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-origin:http://localhost:3000}")
    private String frontendOrigin;

    @Value("${app.oauth.error-path:/login?oauthError=true}")
    private String errorPath;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        log.warn("Fallo de autenticación Google OAuth2: {}", exception.getMessage());
        String targetUrl = buildTargetUrl(frontendOrigin, errorPath);
        response.sendRedirect(targetUrl);
    }

    private String buildTargetUrl(String origin, String path) {
        String cleanOrigin = origin.replaceAll("/+$", "");
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        return cleanOrigin + cleanPath;
    }
}
