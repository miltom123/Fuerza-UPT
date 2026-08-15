package pe.edu.upt.fuerzaupt.settings.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsResponse;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsUpdateRequest;
import pe.edu.upt.fuerzaupt.settings.entity.SiteSettings;
import pe.edu.upt.fuerzaupt.settings.repository.SiteSettingsRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SiteSettingsServiceTest {

    @Mock
    private SiteSettingsRepository siteSettingsRepository;

    @InjectMocks
    private SiteSettingsService siteSettingsService;

    private SiteSettings mockSettings;

    @BeforeEach
    void setUp() {
        mockSettings = new SiteSettings();
        mockSettings.setId(true);
        mockSettings.setEmail("contacto@fuerzaupt.edu.pe");
        mockSettings.setWhatsapp("+51999888777");
        mockSettings.setInstagram("https://instagram.com/fuerzaupt");
        mockSettings.setFacebook("https://facebook.com/fuerzaupt");
        mockSettings.setTiktok("https://tiktok.com/@fuerzaupt");
        mockSettings.setYoutube("https://youtube.com/@fuerzaupt");
        mockSettings.setAddress("Campus Capanique, Tacna");
        mockSettings.setMainMessage("Liderando el cambio");
        mockSettings.setContactText("Contacto Fuerza UPT");
        mockSettings.setUpdatedAt(Instant.now());
        mockSettings.setVersion(1L);
    }

    @Test
    void get_ShouldReturnSiteSettingsResponse_WhenSettingsExist() {
        when(siteSettingsRepository.findById(true)).thenReturn(Optional.of(mockSettings));

        SiteSettingsResponse response = siteSettingsService.get();

        assertNotNull(response);
        assertEquals("contacto@fuerzaupt.edu.pe", response.email());
        assertEquals("+51999888777", response.whatsapp());
        assertEquals("Liderando el cambio", response.mainMessage());
        assertEquals(1L, response.version());
        verify(siteSettingsRepository, times(1)).findById(true);
    }

    @Test
    void get_ShouldThrowException_WhenSettingsNotFound() {
        when(siteSettingsRepository.findById(true)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> siteSettingsService.get());
    }

    @Test
    void update_ShouldUpdateAndReturnResponse_WhenValidInputAndMatchingVersion() {
        when(siteSettingsRepository.findById(true)).thenReturn(Optional.of(mockSettings));
        when(siteSettingsRepository.saveAndFlush(any(SiteSettings.class))).thenAnswer(invocation -> {
            SiteSettings s = invocation.getArgument(0);
            s.setVersion(s.getVersion() + 1);
            return s;
        });

        SiteSettingsUpdateRequest request = new SiteSettingsUpdateRequest(
                "nuevo@fuerzaupt.edu.pe",
                "+51987654321",
                "https://instagram.com/fuerzaupt",
                "https://facebook.com/fuerzaupt",
                "",
                "",
                "Nueva Direccion",
                "Nuevo Mensaje",
                "Nuevo Contacto",
                1L
        );

        SiteSettingsResponse response = siteSettingsService.update(request);

        assertNotNull(response);
        assertEquals("nuevo@fuerzaupt.edu.pe", response.email());
        assertEquals("+51987654321", response.whatsapp());
        assertNull(response.tiktok());
        assertNull(response.youtube());
        assertEquals(2L, response.version());
        verify(siteSettingsRepository, times(1)).saveAndFlush(any(SiteSettings.class));
    }

    @Test
    void update_ShouldThrowOptimisticLockConflictException_WhenVersionMismatch() {
        when(siteSettingsRepository.findById(true)).thenReturn(Optional.of(mockSettings));

        SiteSettingsUpdateRequest request = new SiteSettingsUpdateRequest(
                "nuevo@fuerzaupt.edu.pe", "+51987654321", null, null, null, null, null, null, null,
                99L // Outdated version
        );

        assertThrows(OptimisticLockConflictException.class, () -> siteSettingsService.update(request));
        verify(siteSettingsRepository, never()).saveAndFlush(any());
    }

    @Test
    void update_ShouldThrowOptimisticLockConflictException_WhenSaveFailsWithOptimisticLockException() {
        when(siteSettingsRepository.findById(true)).thenReturn(Optional.of(mockSettings));
        when(siteSettingsRepository.saveAndFlush(any())).thenThrow(new ObjectOptimisticLockingFailureException(SiteSettings.class, true));

        SiteSettingsUpdateRequest request = new SiteSettingsUpdateRequest(
                "nuevo@fuerzaupt.edu.pe", "+51987654321", null, null, null, null, null, null, null,
                1L
        );

        assertThrows(OptimisticLockConflictException.class, () -> siteSettingsService.update(request));
    }

    @Test
    void update_ShouldThrowBusinessException_WhenSocialUrlIsInvalid() {
        SiteSettingsUpdateRequest request = new SiteSettingsUpdateRequest(
                "nuevo@fuerzaupt.edu.pe", "+51987654321", "invalid-url", null, null, null, null, null, null,
                1L
        );

        assertThrows(BusinessException.class, () -> siteSettingsService.update(request));
        verify(siteSettingsRepository, never()).findById(any());
    }
}
