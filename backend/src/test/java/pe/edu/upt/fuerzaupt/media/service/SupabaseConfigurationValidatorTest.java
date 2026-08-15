package pe.edu.upt.fuerzaupt.media.service;

import pe.edu.upt.fuerzaupt.media.config.SupabaseConfigurationValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupabaseConfigurationValidatorTest {

    @Mock
    private Environment environment;

    @InjectMocks
    private SupabaseConfigurationValidator validator;

    @Test
    @DisplayName("M-02: Produccion debe fallar si falta credenciales Supabase")
    void productionFailsWithoutSupabaseCredentials() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(true);
        ReflectionTestUtils.setField(validator, "url", "");
        ReflectionTestUtils.setField(validator, "serviceRoleKey", "");

        assertThrows(IllegalStateException.class, () -> validator.validate());
    }

    @Test
    @DisplayName("M-02: Produccion pasa cuando credenciales estan presentes")
    void productionPassesWithSupabaseCredentials() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(true);
        ReflectionTestUtils.setField(validator, "url", "https://xyz.supabase.co");
        ReflectionTestUtils.setField(validator, "serviceRoleKey", "service-key");

        assertDoesNotThrow(() -> validator.validate());
    }

    @Test
    @DisplayName("M-02: Entorno no productivo permite fallback")
    void nonProductionPassesWithoutSupabaseCredentials() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(false);
        ReflectionTestUtils.setField(validator, "url", "");
        ReflectionTestUtils.setField(validator, "serviceRoleKey", "");

        assertDoesNotThrow(() -> validator.validate());
    }
}
