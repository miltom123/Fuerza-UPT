package pe.edu.upt.fuerzaupt.submission.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.upt.fuerzaupt.common.exception.RateLimitExceededException;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimit;
import pe.edu.upt.fuerzaupt.submission.entity.RequestRateLimitId;
import pe.edu.upt.fuerzaupt.submission.repository.RequestRateLimitRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SharedRateLimitServiceTest {

    @Mock
    private RequestRateLimitRepository requestRateLimitRepository;

    @InjectMocks
    private SharedRateLimitService service;

    @Test
    @DisplayName("Acepta peticiones dentro del limite de ventana")
    void acceptsRequestsInsideTheWindowLimit() {
        RequestRateLimitId id = new RequestRateLimitId("contact", "127.0.0.1");
        RequestRateLimit record = new RequestRateLimit(id, Instant.now(), 4);
        when(requestRateLimitRepository.findForUpdate(any())).thenReturn(Optional.of(record));

        assertDoesNotThrow(() -> service.consume("contact", "127.0.0.1", 5, Duration.ofHours(1)));
    }

    @Test
    @DisplayName("Rechaza peticiones por encima del limite de ventana")
    void rejectsRequestsOverTheWindowLimit() {
        RequestRateLimitId id = new RequestRateLimitId("contact", "127.0.0.1");
        RequestRateLimit record = new RequestRateLimit(id, Instant.now(), 5);
        when(requestRateLimitRepository.findForUpdate(any())).thenReturn(Optional.of(record));

        assertThrows(RateLimitExceededException.class,
                () -> service.consume("contact", "127.0.0.1", 5, Duration.ofHours(1)));
    }
}
