package pe.edu.upt.fuerzaupt.admin.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.edu.upt.fuerzaupt.admin.entity.CacheInvalidationEvent;
import pe.edu.upt.fuerzaupt.admin.repository.CacheInvalidationEventRepository;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheInvalidationPoller {

    private final CacheInvalidationEventRepository repository;
    private final CacheInvalidationService invalidationService;
    private final AtomicLong lastSeenId = new AtomicLong();

    @PostConstruct
    void initialize() {
        Long current = repository.findMaxId();
        lastSeenId.set(current == null ? 0 : current);
    }

    @Scheduled(fixedDelayString = "${app.cache-invalidation.poll-ms:5000}")
    public void synchronize() {
        List<CacheInvalidationEvent> events = repository.findByIdGreaterThanOrderByIdAsc(
                lastSeenId.get(),
                PageRequest.of(0, 100)
        );

        for (CacheInvalidationEvent event : events) {
            invalidationService.invalidateLocal(event.getModule());
            lastSeenId.set(event.getId());
            log.info("Applied distributed cache invalidation {} for module {}", lastSeenId.get(), event.getModule());
        }
    }

    public long lastSeenId() {
        return lastSeenId.get();
    }
}
