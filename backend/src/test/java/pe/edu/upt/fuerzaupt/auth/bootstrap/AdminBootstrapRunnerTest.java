package pe.edu.upt.fuerzaupt.auth.bootstrap;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import pe.edu.upt.fuerzaupt.auth.entity.Role;
import pe.edu.upt.fuerzaupt.auth.entity.User;
import pe.edu.upt.fuerzaupt.auth.repository.RoleRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminBootstrapRunner bootstrapRunner;

    @Test
    @DisplayName("H-04: Si bootstrap-enabled es false, no ejecuta creacion")
    void disabledBootstrapDoesNothing() {
        ReflectionTestUtils.setField(bootstrapRunner, "bootstrapEnabled", false);
        ReflectionTestUtils.setField(bootstrapRunner, "adminEmail", "admin@fuerzaupt.pe");
        ReflectionTestUtils.setField(bootstrapRunner, "adminPassword", "SecurePass123!");

        bootstrapRunner.run();

        verifyNoInteractions(userRepository, roleRepository, passwordEncoder);
    }

    @Test
    @DisplayName("H-04: Si el usuario ya existe, es create-only y no modifica nada")
    void existingUserNotModified() {
        ReflectionTestUtils.setField(bootstrapRunner, "bootstrapEnabled", true);
        ReflectionTestUtils.setField(bootstrapRunner, "adminEmail", "admin@fuerzaupt.pe");
        ReflectionTestUtils.setField(bootstrapRunner, "adminPassword", "SecurePass123!");
        ReflectionTestUtils.setField(bootstrapRunner, "adminName", "Admin");

        Role adminRole = new Role();
        adminRole.setName("ADMIN");
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));
        when(userRepository.findByEmail("admin@fuerzaupt.pe")).thenReturn(Optional.of(new User()));

        bootstrapRunner.run();

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("H-04: Contraseña debil es rechazada sin crear usuario")
    void weakPasswordAbortsBootstrap() {
        ReflectionTestUtils.setField(bootstrapRunner, "bootstrapEnabled", true);
        ReflectionTestUtils.setField(bootstrapRunner, "adminEmail", "admin@fuerzaupt.pe");
        ReflectionTestUtils.setField(bootstrapRunner, "adminPassword", "123456");
        ReflectionTestUtils.setField(bootstrapRunner, "adminName", "Admin");

        bootstrapRunner.run();

        verifyNoInteractions(roleRepository, userRepository, passwordEncoder);
    }
}
