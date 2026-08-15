package pe.edu.upt.fuerzaupt.settings.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.common.exception.BusinessException;
import pe.edu.upt.fuerzaupt.common.exception.OptimisticLockConflictException;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsResponse;
import pe.edu.upt.fuerzaupt.settings.dto.SiteSettingsUpdateRequest;
import pe.edu.upt.fuerzaupt.settings.entity.SiteSettings;
import pe.edu.upt.fuerzaupt.settings.repository.SiteSettingsRepository;

import java.net.URI;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;
    // Database access now fully handled by SiteSettingsRepository

    @Cacheable("public-settings")
    @Transactional(readOnly = true)
    public SiteSettingsResponse publicSettings() {
        return get();
    }

    @Transactional(readOnly = true)
    public SiteSettingsResponse get() {
        SiteSettings settings = siteSettingsRepository.findById(true)
                .orElseThrow(() -> new IllegalStateException("No existe configuracion institucional."));

        return mapToResponse(settings);
    }

    @Transactional
    @CacheEvict(value = "public-settings", allEntries = true)
    public SiteSettingsResponse update(SiteSettingsUpdateRequest input) {
        validateUrl(input.instagram());
        validateUrl(input.facebook());
        validateUrl(input.tiktok());
        validateUrl(input.youtube());

        SiteSettings settings = siteSettingsRepository.findById(true)
                .orElseThrow(() -> new IllegalStateException("No existe configuracion institucional."));

        if (!Objects.equals(settings.getVersion(), input.version())) {
            throw new OptimisticLockConflictException();
        }

        settings.setEmail(blankToNull(input.email()));
        settings.setWhatsapp(blankToNull(input.whatsapp()));
        settings.setInstagram(blankToNull(input.instagram()));
        settings.setFacebook(blankToNull(input.facebook()));
        settings.setTiktok(blankToNull(input.tiktok()));
        settings.setYoutube(blankToNull(input.youtube()));
        settings.setAddress(blankToNull(input.address()));
        settings.setMainMessage(blankToNull(input.mainMessage()));
        settings.setContactText(blankToNull(input.contactText()));

        try {
            SiteSettings saved = siteSettingsRepository.saveAndFlush(settings);
            return mapToResponse(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new OptimisticLockConflictException();
        }
    }

    private SiteSettingsResponse mapToResponse(SiteSettings settings) {
        return new SiteSettingsResponse(
                settings.getEmail(),
                settings.getWhatsapp(),
                settings.getInstagram(),
                settings.getFacebook(),
                settings.getTiktok(),
                settings.getYoutube(),
                settings.getAddress(),
                settings.getMainMessage(),
                settings.getContactText(),
                settings.getUpdatedAt(),
                settings.getVersion()
        );
    }

    private void validateUrl(String value) {
        if (value == null || value.isBlank()) return;
        try {
            URI uri = URI.create(value.trim());
            String scheme = uri.getScheme();
            if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new BusinessException("Uno de los enlaces sociales no es una URL valida.");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
