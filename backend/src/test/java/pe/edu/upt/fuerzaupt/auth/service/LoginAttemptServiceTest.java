package pe.edu.upt.fuerzaupt.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.upt.fuerzaupt.auth.entity.LoginAttempt;
import pe.edu.upt.fuerzaupt.auth.exception.TooManyLoginAttemptsException;
import pe.edu.upt.fuerzaupt.auth.repository.LoginAttemptRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginAttemptServiceTest {

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @InjectMocks
    private LoginAttemptService service;

    @Test
    @DisplayName("Permite acceso cuando no existe bloqueo previo")
    void allowsKeyWithoutActiveBlock() {
        when(loginAttemptRepository.findById("key")).thenReturn(Optional.empty());
        assertDoesNotThrow(() -> service.ensureAllowed("key"));
    }

    @Test
    @DisplayName("Rechaza acceso cuando existe un bloqueo activo")
    void rejectsKeyWithActiveBlock() {
        LoginAttempt blocked = new LoginAttempt("key", 5, Instant.now().plusSeconds(600));
        when(loginAttemptRepository.findById("key")).thenReturn(Optional.of(blocked));
        assertThrows(TooManyLoginAttemptsException.class, () -> service.ensureAllowed("key"));
    }

    @Test
    @DisplayName("Login exitoso elimina el registro de intentos fallidos")
    void successfulLoginClearsStoredFailures() {
        service.recordSuccess("key");
        verify(loginAttemptRepository).deleteById("key");
    }
}
