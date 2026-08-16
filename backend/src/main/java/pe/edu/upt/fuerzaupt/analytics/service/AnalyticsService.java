package pe.edu.upt.fuerzaupt.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.analytics.dto.DailyVisitStat;
import pe.edu.upt.fuerzaupt.analytics.entity.PageView;
import pe.edu.upt.fuerzaupt.analytics.repository.PageViewRepository;
import pe.edu.upt.fuerzaupt.security.PrivacyHashService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    public static final ZoneId LIMA_ZONE = ZoneId.of("America/Lima");
    private static final DateTimeFormatter LABEL_FORMATTER = DateTimeFormatter.ofPattern("d MMM", new Locale("es", "PE"));

    private final PageViewRepository pageViewRepository;
    private final PrivacyHashService privacyHashService;

    @Transactional
    public void trackVisit(String rawPath, String rawReferrer, String rawIp, String rawUserAgent) {
        if (rawPath == null || rawPath.isBlank()) return;

        String path = rawPath.trim();
        int queryIndex = path.indexOf('?');
        if (queryIndex != -1) {
            path = path.substring(0, queryIndex);
        }

        // Exclude admin, API, actuator, and static assets
        if (shouldIgnorePath(path)) {
            return;
        }

        String userAgent = rawUserAgent != null ? rawUserAgent.trim() : "";
        if (isBot(userAgent)) {
            return;
        }

        String ip = (rawIp != null && !rawIp.isBlank()) ? rawIp.trim() : "127.0.0.1";
        String visitorHash = privacyHashService.hash(ip + "|" + userAgent, "VISITOR_PAGEVIEW");

        PageView pageView = new PageView();
        pageView.setId(UUID.randomUUID());
        pageView.setPath(path.length() > 500 ? path.substring(0, 500) : path);
        pageView.setVisitorHash(visitorHash);
        pageView.setReferrer((rawReferrer != null && rawReferrer.length() > 500) ? rawReferrer.substring(0, 500) : rawReferrer);
        pageView.setUserAgent(userAgent.length() > 300 ? userAgent.substring(0, 300) : userAgent);
        pageView.setCreatedAt(Instant.now());

        pageViewRepository.save(pageView);
    }

    @Transactional(readOnly = true)
    public List<DailyVisitStat> getDailyVisits(LocalDate fromDate, LocalDate toDate) {
        Instant start = fromDate.atStartOfDay(LIMA_ZONE).toInstant();
        Instant end = toDate.plusDays(1).atStartOfDay(LIMA_ZONE).toInstant();

        List<PageView> views = pageViewRepository.findBetween(start, end);

        // Group visits by LocalDate in America/Lima
        Map<LocalDate, List<PageView>> grouped = views.stream()
                .collect(Collectors.groupingBy(v -> ZonedDateTime.ofInstant(v.getCreatedAt(), LIMA_ZONE).toLocalDate()));

        List<DailyVisitStat> result = new ArrayList<>();
        LocalDate curr = fromDate;
        while (!curr.isAfter(toDate)) {
            List<PageView> dayViews = grouped.getOrDefault(curr, Collections.emptyList());
            long visits = dayViews.size();
            long uniqueVisitors = dayViews.stream().map(PageView::getVisitorHash).distinct().count();
            String label = curr.format(LABEL_FORMATTER);

            result.add(new DailyVisitStat(curr.toString(), label, visits, uniqueVisitors));
            curr = curr.plusDays(1);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public long countVisits(LocalDate fromDate, LocalDate toDate) {
        Instant start = fromDate.atStartOfDay(LIMA_ZONE).toInstant();
        Instant end = toDate.plusDays(1).atStartOfDay(LIMA_ZONE).toInstant();
        return pageViewRepository.countBetween(start, end);
    }

    @Transactional(readOnly = true)
    public long countUniqueVisitors(LocalDate fromDate, LocalDate toDate) {
        Instant start = fromDate.atStartOfDay(LIMA_ZONE).toInstant();
        Instant end = toDate.plusDays(1).atStartOfDay(LIMA_ZONE).toInstant();
        return pageViewRepository.countDistinctVisitorsBetween(start, end);
    }

    private boolean shouldIgnorePath(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.startsWith("/administracion")
                || lower.startsWith("/api")
                || lower.startsWith("/actuator")
                || lower.startsWith("/_next")
                || lower.startsWith("/swagger-ui")
                || lower.startsWith("/v3/api-docs")) {
            return true;
        }

        return lower.endsWith(".png")
                || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".webp")
                || lower.endsWith(".svg")
                || lower.endsWith(".ico")
                || lower.endsWith(".css")
                || lower.endsWith(".js")
                || lower.endsWith(".map")
                || lower.endsWith(".json")
                || lower.endsWith(".txt")
                || lower.endsWith(".woff")
                || lower.endsWith(".woff2")
                || lower.endsWith(".ttf");
    }

    private boolean isBot(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return false;
        String lower = userAgent.toLowerCase(Locale.ROOT);
        return lower.contains("googlebot")
                || lower.contains("bingbot")
                || lower.contains("yandexbot")
                || lower.contains("duckduckbot")
                || lower.contains("baiduspider")
                || lower.contains("curl")
                || lower.contains("wget")
                || lower.contains("postman")
                || lower.contains("python-requests");
    }
}
