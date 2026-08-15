package pe.edu.upt.fuerzaupt;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextTest {

    @MockBean
    private CacheManager cacheManager;

    @MockBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @Test
    @DisplayName("CR-01: El contenedor de Spring Boot inicie correctamente sin duplicados de beans")
    void contextLoads() {
        assertDoesNotThrow(() -> {
            // Verifica que el contexto de Spring cargue completamente sin excepciones
        });
    }
}
