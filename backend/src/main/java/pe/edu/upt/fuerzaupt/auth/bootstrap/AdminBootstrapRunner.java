package pe.edu.upt.fuerzaupt.auth.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.auth.entity.Role;
import pe.edu.upt.fuerzaupt.auth.entity.User;
import pe.edu.upt.fuerzaupt.auth.repository.RoleRepository;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;

import java.util.Optional;
import java.util.Locale;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap-enabled:false}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminName;

    private static final java.util.Set<String> WEAK_PASSWORDS = java.util.Set.of(
            "cambiar_en_entorno", "password", "admin", "123456", "12345678"
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (!bootstrapEnabled) {
            log.info("Admin bootstrap is disabled via configuration.");
            return;
        }

        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("Admin credentials are not fully configured in environment properties.");
            return;
        }

        if (WEAK_PASSWORDS.contains(adminPassword.trim().toLowerCase(java.util.Locale.ROOT))) {
            log.error("Admin bootstrap aborted: Configured password is a weak or placeholder value.");
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("ADMIN role not found. Verify database/schema-final.sql and initial role seed."));

        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            log.info("Configured bootstrap admin already exists; no changes applied.");
            return;
        }

        log.info("Creating configured admin user.");

        User adminUser = new User();
        adminUser.setEmail(normalizedEmail);
        adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
        adminUser.setDisplayName(adminName);
        adminUser.getRoles().add(adminRole);

        userRepository.save(adminUser);
        log.info("Configured admin user created successfully.");
    }
}
