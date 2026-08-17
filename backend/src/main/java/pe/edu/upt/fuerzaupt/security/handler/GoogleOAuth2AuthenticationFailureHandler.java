package pe.edu.upt.fuerzaupt.security.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class GoogleOAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.frontend-origin:http://localhost:3000}")
    private String frontendOrigin;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        log.warn("Fallo de autenticación Google OAuth2: {}", exception.getMessage());
        
        String errorCode = "generic";
        if (exception instanceof OAuth2AuthenticationException oae && oae.getError() != null) {
            errorCode = oae.getError().getErrorCode();
        } else if (exception.getMessage() != null && exception.getMessage().contains("access_denied")) {
            errorCode = "access_denied";
        }

        String targetUrl = buildTargetUrl(frontendOrigin, "/unete?oauthError=" + errorCode + "#registro");
        response.sendRedirect(targetUrl);
    }

    private String buildTargetUrl(String origin, String path) {
        String cleanOrigin = origin.replaceAll("/+$", "");
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        return cleanOrigin + cleanPath;
    }
}
