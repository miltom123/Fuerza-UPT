package pe.edu.upt.fuerzaupt.security.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import pe.edu.upt.fuerzaupt.auth.entity.Role;
import pe.edu.upt.fuerzaupt.auth.entity.User;
import pe.edu.upt.fuerzaupt.auth.entity.UserIdentity;
import pe.edu.upt.fuerzaupt.auth.repository.RoleRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserIdentityRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;
import pe.edu.upt.fuerzaupt.security.CustomUserDetails;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuthUserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserIdentityRepository userIdentityRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private OAuth2User oAuth2User;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Captor
    private ArgumentCaptor<UserIdentity> identityCaptor;

    private OAuthUserManagementService service;

    @BeforeEach
    void setUp() {
        service = new OAuthUserManagementService(userRepository, userIdentityRepository, roleRepository);
    }

    @Test
    @DisplayName("Should login successfully with existing Google UserIdentity")
    void existingIdentity_returnsUserDetails() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-123");
        attributes.put("email", "estudiante@virtual.upt.pe");
        attributes.put("email_verified", true);

        when(oAuth2User.getAttributes()).thenReturn(attributes);

        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("estudiante@virtual.upt.pe");
        existingUser.setDisplayName("Estudiante UPT");
        existingUser.setEnabled(true);

        UserIdentity identity = UserIdentity.builder()
                .id(UUID.randomUUID())
                .user(existingUser)
                .provider("GOOGLE")
                .providerSubject("google-sub-123")
                .build();

        when(userIdentityRepository.findByProviderAndProviderSubject("GOOGLE", "google-sub-123"))
                .thenReturn(Optional.of(identity));

        CustomUserDetails userDetails = service.processOAuthUser(oAuth2User, "GOOGLE");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("estudiante@virtual.upt.pe");
        verify(userRepository).save(existingUser);
    }

    @Test
    @DisplayName("Should link existing local account cleanly when email matches and is verified")
    void existingLocalAccount_linksIdentity() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-456");
        attributes.put("email", "juan.perez@virtual.upt.pe");
        attributes.put("email_verified", true);

        when(oAuth2User.getAttributes()).thenReturn(attributes);
        when(userIdentityRepository.findByProviderAndProviderSubject("GOOGLE", "google-sub-456"))
                .thenReturn(Optional.empty());

        User localUser = new User();
        localUser.setId(UUID.randomUUID());
        localUser.setEmail("juan.perez@virtual.upt.pe");
        localUser.setPasswordHash("$2a$12$somehash");
        localUser.setDisplayName("Juan Perez");
        localUser.setEnabled(true);

        when(userRepository.findByEmail("juan.perez@virtual.upt.pe")).thenReturn(Optional.of(localUser));

        CustomUserDetails userDetails = service.processOAuthUser(oAuth2User, "GOOGLE");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("juan.perez@virtual.upt.pe");

        verify(userIdentityRepository).save(identityCaptor.capture());
        UserIdentity createdIdentity = identityCaptor.getValue();
        assertThat(createdIdentity.getProvider()).isEqualTo("GOOGLE");
        assertThat(createdIdentity.getProviderSubject()).isEqualTo("google-sub-456");
        assertThat(createdIdentity.getUser()).isEqualTo(localUser);
    }

    @Test
    @DisplayName("Should create new user with safe default USER role when user does not exist")
    void newGoogleUser_createsUserWithUserRole() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-789");
        attributes.put("email", "nuevo.estudiante@virtual.upt.pe");
        attributes.put("name", "Nuevo Estudiante");
        attributes.put("email_verified", true);

        when(oAuth2User.getAttributes()).thenReturn(attributes);
        when(userIdentityRepository.findByProviderAndProviderSubject("GOOGLE", "google-sub-789"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("nuevo.estudiante@virtual.upt.pe")).thenReturn(Optional.empty());

        Role defaultRole = new Role();
        defaultRole.setId(UUID.randomUUID());
        defaultRole.setName("USER");
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(defaultRole));

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CustomUserDetails userDetails = service.processOAuthUser(oAuth2User, "GOOGLE");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("nuevo.estudiante@virtual.upt.pe");
        assertThat(userDetails.getDisplayName()).isEqualTo("Nuevo Estudiante");

        verify(userRepository).save(userCaptor.capture());
        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getPasswordHash()).isNull(); // Null password for OAuth-only users
        assertThat(createdUser.getRoles()).containsExactly(defaultRole);
    }

    @Test
    @DisplayName("Should reject login when Google email is unverified")
    void unverifiedEmail_throwsException() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-999");
        attributes.put("email", "unverified@virtual.upt.pe");
        attributes.put("email_verified", false);

        when(oAuth2User.getAttributes()).thenReturn(attributes);

        assertThatThrownBy(() -> service.processOAuthUser(oAuth2User, "GOOGLE"))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("no está verificado");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject login when email domain does not match allowed domain list")
    void domainRestriction_rejectsUnauthorizedDomain() {
        ReflectionTestUtils.setField(service, "allowedEmailDomains", "upt.edu.pe,virtual.upt.pe");

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-888");
        attributes.put("email", "hacker@gmail.com");
        attributes.put("email_verified", true);

        when(oAuth2User.getAttributes()).thenReturn(attributes);

        assertThatThrownBy(() -> service.processOAuthUser(oAuth2User, "GOOGLE"))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("no está autorizado");
    }

    @Test
    @DisplayName("Should reject login when user account is disabled")
    void disabledUser_throwsException() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-disabled");
        attributes.put("email", "disabled@virtual.upt.pe");
        attributes.put("email_verified", true);

        when(oAuth2User.getAttributes()).thenReturn(attributes);

        User disabledUser = new User();
        disabledUser.setId(UUID.randomUUID());
        disabledUser.setEmail("disabled@virtual.upt.pe");
        disabledUser.setEnabled(false);

        UserIdentity identity = UserIdentity.builder()
                .id(UUID.randomUUID())
                .user(disabledUser)
                .provider("GOOGLE")
                .providerSubject("google-sub-disabled")
                .build();

        when(userIdentityRepository.findByProviderAndProviderSubject("GOOGLE", "google-sub-disabled"))
                .thenReturn(Optional.of(identity));

        assertThatThrownBy(() -> service.processOAuthUser(oAuth2User, "GOOGLE"))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .hasMessageContaining("deshabilitada");
    }
}
