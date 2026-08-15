package pe.edu.upt.fuerzaupt.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;
import pe.edu.upt.fuerzaupt.auth.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class SchemaCompatibilityIntegrationTest {

    @MockBean
    private CacheManager cacheManager;

    @MockBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Verify JPA Entity schema mapping compatibility with zero Flyway dependency")
    void verifyJpaSchemaCompatibility() {
        assertNotNull(userRepository, "UserRepository JPA bean should be initialized cleanly without Flyway");
    }
}
