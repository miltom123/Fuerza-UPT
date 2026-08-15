package pe.edu.upt.fuerzaupt.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.auth.controller.AuthController;
import pe.edu.upt.fuerzaupt.auth.dto.LoginRequest;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;
import pe.edu.upt.fuerzaupt.auth.service.LoginAttemptService;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionFixationTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private SecurityContextRepository securityContextRepository;

    @Mock
    private SessionAuthenticationStrategy sessionAuthenticationStrategy;

    @Mock
    private LoginAttemptService loginAttemptService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientIpResolver clientIpResolver;

    @Mock
    private pe.edu.upt.fuerzaupt.security.PrivacyHashService privacyHashService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("M-01: El login debe invocar SessionAuthenticationStrategy.onAuthentication para rotar la sesion")
    void loginTriggersSessionRotation() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setRemoteAddr("127.0.0.1");

        when(clientIpResolver.resolve(request)).thenReturn("127.0.0.1");

        CustomUserDetails userDetails = new CustomUserDetails(
                UUID.randomUUID(),
                "admin@fuerzaupt.pe",
                "hashed",
                "Admin",
                true,
                AuthorityUtils.createAuthorityList("ROLE_ADMIN")
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails, "password", userDetails.getAuthorities()
        );

        when(authenticationManager.authenticate(any())).thenReturn(auth);

        LoginRequest loginRequest = new LoginRequest("admin@fuerzaupt.pe", "Password123!");
        authController.login(loginRequest, request, response);

        verify(sessionAuthenticationStrategy, times(1))
                .onAuthentication(auth, request, response);
        verify(securityContextRepository, times(1))
                .saveContext(any(), eq(request), eq(response));
    }
}
