package pe.edu.upt.fuerzaupt.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.auth.dto.AuthSessionResponse;
import pe.edu.upt.fuerzaupt.auth.dto.AuthUserResponse;
import pe.edu.upt.fuerzaupt.auth.dto.CsrfTokenResponse;
import pe.edu.upt.fuerzaupt.auth.dto.LoginRequest;
import pe.edu.upt.fuerzaupt.auth.entity.User;
import pe.edu.upt.fuerzaupt.auth.exception.InvalidCredentialsException;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;
import pe.edu.upt.fuerzaupt.auth.service.LoginAttemptService;
import pe.edu.upt.fuerzaupt.admin.service.AuditLogService;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;
import pe.edu.upt.fuerzaupt.security.ClientIpResolver;
import pe.edu.upt.fuerzaupt.security.PrivacyHashService;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final LoginAttemptService loginAttemptService;
    private final UserRepository userRepository;
    private final ClientIpResolver clientIpResolver;
    private final PrivacyHashService privacyHashService;
    private final AuditLogService auditLogService;

    @Value("${server.servlet.session.cookie.name:FUERZA_UPT_SESSION}")
    private String sessionCookieName;

    @GetMapping("/csrf")
    public ResponseEntity<CsrfTokenResponse> getCsrfToken(CsrfToken csrfToken) {
        return ResponseEntity.ok(new CsrfTokenResponse(
                csrfToken.getToken(),
                csrfToken.getHeaderName(),
                csrfToken.getParameterName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthSessionResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String clientIp = clientIpResolver.resolve(request);
        String normalizedEmail = loginRequest.email().trim().toLowerCase(java.util.Locale.ROOT);
        String ipKey = privacyHashService.hash(clientIp, "login-ip");
        String accountKey = privacyHashService.hash(normalizedEmail, "login-account");
        String combinationKey = privacyHashService.hash(clientIp + "|" + normalizedEmail, "login-combination");

        loginAttemptService.ensureAllowedMulti(ipKey, accountKey, combinationKey);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.email().trim().toLowerCase(),
                            loginRequest.password()
                    )
            );
        } catch (BadCredentialsException exception) {
            loginAttemptService.recordFailureMulti(ipKey, accountKey, combinationKey);
            throw new InvalidCredentialsException();
        }

        loginAttemptService.recordSuccessMulti(ipKey, accountKey, combinationKey);
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        userRepository.findById(principal.getId()).ifPresent(this::recordSuccessfulLogin);
        auditLogService.record(authentication, "LOGIN", "users", principal.getId(), null,
                Map.of("email", principal.getUsername()), request);

        return ResponseEntity.ok(toSession(principal, request.getSession(false)));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthSessionResponse> getCurrentUser(Authentication authentication, HttpServletRequest request) {
        return ResponseEntity.ok(toSession(requirePrincipal(authentication), request.getSession(false)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails principal) {
            auditLogService.record(authentication, "LOGOUT", "users", principal.getId(),
                    Map.of("email", principal.getUsername()), null, request);
        }
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        Cookie sessionCookie = new Cookie(sessionCookieName, "");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(0);
        response.addCookie(sessionCookie);
        return ResponseEntity.noContent().build();
    }

    private CustomUserDetails requirePrincipal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new InvalidCredentialsException();
        }
        return principal;
    }

    private AuthSessionResponse toSession(CustomUserDetails principal, HttpSession session) {
        int timeout = session == null ? 28_800 : session.getMaxInactiveInterval();
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replaceFirst("^ROLE_", ""))
                .sorted()
                .toList();

        AuthUserResponse user = new AuthUserResponse(
                principal.getId(),
                principal.getUsername(),
                principal.getDisplayName(),
                roles
        );
        return new AuthSessionResponse(user, Instant.now().plusSeconds(timeout));
    }

    private void recordSuccessfulLogin(User user) {
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);
    }

}
