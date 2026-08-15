package pe.edu.upt.fuerzaupt.admin.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pe.edu.upt.fuerzaupt.admin.entity.CacheInvalidationEvent;
import pe.edu.upt.fuerzaupt.admin.model.AdminModule;
import pe.edu.upt.fuerzaupt.admin.repository.CacheInvalidationEventRepository;

import java.util.List;

@Slf4j
@Service
public class CacheInvalidationService {

    private final CacheManager cacheManager;
    private final CacheInvalidationEventRepository cacheInvalidationEventRepository;
    private final RestClient restClient;
    private final String revalidationUrl;
    private final String revalidationSecret;

    public CacheInvalidationService(
            CacheManager cacheManager,
            CacheInvalidationEventRepository cacheInvalidationEventRepository,
            RestClient.Builder restClientBuilder,
            @Value("${app.revalidation.url:}") String revalidationUrl,
            @Value("${app.revalidation.secret:}") String revalidationSecret
    ) {
        this.cacheManager = cacheManager;
        this.cacheInvalidationEventRepository = cacheInvalidationEventRepository;
        this.restClient = restClientBuilder.build();
        this.revalidationUrl = revalidationUrl;
        this.revalidationSecret = revalidationSecret;
    }

    public void invalidate(String moduleInput) {
        AdminModule module;
        try {
            module = AdminModule.from(moduleInput);
        } catch (Exception ex) {
            log.warn("Invalidation skipped for unknown module alias: {}", moduleInput);
            return;
        }

        String canonical = module.getCanonicalName();
        String tag = canonical;

        CacheInvalidationEvent event = new CacheInvalidationEvent();
        event.setModule(canonical);
        cacheInvalidationEventRepository.save(event);

        invalidateLocal(canonical);

        if (revalidationUrl.isBlank() || revalidationSecret.isBlank()) {
            log.debug("Next.js revalidation is not configured; local caches were cleared.");
            return;
        }

        try {
            restClient.post()
                    .uri(revalidationUrl)
                    .header("X-Revalidation-Secret", revalidationSecret)
                    .body(new RevalidationRequest(List.of(tag, "home")))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            log.warn("Next.js cache revalidation failed for tag {}: {}", tag, exception.getMessage());
        }
    }

    public void invalidateLocal(String moduleInput) {
        AdminModule module;
        try {
            module = AdminModule.from(moduleInput);
        } catch (Exception ex) {
            return;
        }
        clear(module.getCacheName());
        clear("public-home");
    }

    private void clear(String name) {
        Cache cache = cacheManager.getCache(name);
        if (cache != null) {
            cache.clear();
        }
    }

    private record RevalidationRequest(List<String> tags) {
    }
}
