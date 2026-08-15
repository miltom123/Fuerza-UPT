package pe.edu.upt.fuerzaupt.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.auth.entity.Role;
import pe.edu.upt.fuerzaupt.auth.entity.User;
import pe.edu.upt.fuerzaupt.auth.entity.UserIdentity;
import pe.edu.upt.fuerzaupt.auth.repository.RoleRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserIdentityRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthUserManagementService {

    private final UserRepository userRepository;
    private final UserIdentityRepository userIdentityRepository;
    private final RoleRepository roleRepository;

    @Value("${app.oauth.allowed-email-domains:}")
    private String allowedEmailDomains;

    @Transactional
    public CustomUserDetails processOAuthUser(OAuth2User oAuth2User, String providerName) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Extract OIDC claims
        String sub = (String) attributes.get("sub");
        if (sub == null || sub.isBlank()) {
            sub = oAuth2User.getName();
        }
        if (sub == null || sub.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_token"), "Identificador de usuario OAuth no encontrado (sub)");
        }

        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_email"), "Email no proporcionado por Google");
        }
        email = email.trim().toLowerCase();

        Boolean emailVerified = getEmailVerified(attributes);
        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("unverified_email"), "El correo electrónico de Google no está verificado");
        }

        validateEmailDomain(email);

        String provider = providerName.toUpperCase();
        String finalSub = sub;
        String finalEmail = email;

        // 1. Search existing UserIdentity by (provider, provider_subject)
        Optional<UserIdentity> existingIdentity = userIdentityRepository.findByProviderAndProviderSubject(provider, finalSub);
        if (existingIdentity.isPresent()) {
            User user = existingIdentity.get().getUser();
            if (!user.isEnabled()) {
                throw new OAuth2AuthenticationException(new OAuth2Error("user_disabled"), "La cuenta de usuario se encuentra deshabilitada");
            }
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
            return CustomUserDetails.build(user);
        }

        // 2. Search existing local User by email
        Optional<User> existingUser = userRepository.findByEmail(finalEmail);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (!user.isEnabled()) {
                throw new OAuth2AuthenticationException(new OAuth2Error("user_disabled"), "La cuenta de usuario se encuentra deshabilitada");
            }

            // Secure account linking for verified email
            UserIdentity identity = UserIdentity.builder()
                    .user(user)
                    .provider(provider)
                    .providerSubject(finalSub)
                    .build();
            userIdentityRepository.save(identity);

            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
            log.info("Cuenta local vinculada exitosamente con identidad OAuth: userId={}, provider={}", user.getId(), provider);
            return CustomUserDetails.build(user);
        }

        // 3. Create new user with safe default role (NEVER ADMIN)
        String name = (String) attributes.get("name");
        if (name == null || name.isBlank()) {
            name = (String) attributes.get("given_name");
        }
        if (name == null || name.isBlank()) {
            name = finalEmail.split("@")[0];
        }

        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        newUser.setEmail(finalEmail);
        newUser.setDisplayName(name);
        newUser.setPasswordHash(null); // OAuth user without local password
        newUser.setEnabled(true);
        newUser.setLastLoginAt(Instant.now());

        // Assign safe default role USER if present
        Optional<Role> userRole = roleRepository.findByName("USER");
        userRole.ifPresent(role -> newUser.setRoles(Set.of(role)));

        User savedUser = userRepository.save(newUser);

        UserIdentity newIdentity = UserIdentity.builder()
                .user(savedUser)
                .provider(provider)
                .providerSubject(finalSub)
                .build();
        userIdentityRepository.save(newIdentity);

        log.info("Nuevo usuario creado vía OAuth: userId={}, provider={}", savedUser.getId(), provider);
        return CustomUserDetails.build(savedUser);
    }

    private Boolean getEmailVerified(Map<String, Object> attributes) {
        Object emailVerifiedObj = attributes.get("email_verified");
        if (emailVerifiedObj instanceof Boolean b) {
            return b;
        }
        if (emailVerifiedObj instanceof String s) {
            return Boolean.parseBoolean(s);
        }
        return false;
    }

    private void validateEmailDomain(String email) {
        if (allowedEmailDomains == null || allowedEmailDomains.isBlank()) {
            return;
        }
        List<String> allowed = Arrays.stream(allowedEmailDomains.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .toList();

        if (allowed.isEmpty()) {
            return;
        }

        String domain = email.substring(email.indexOf("@") + 1);
        if (!allowed.contains(domain)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_domain"), "El dominio del correo (" + domain + ") no está autorizado");
        }
    }
}
