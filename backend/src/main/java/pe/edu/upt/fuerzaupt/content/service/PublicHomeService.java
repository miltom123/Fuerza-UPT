package pe.edu.upt.fuerzaupt.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import pe.edu.upt.fuerzaupt.content.dto.HomePublicResponse;
import pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse;
import pe.edu.upt.fuerzaupt.project.service.ProjectAdminService;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublicHomeService {

    private static final Set<String> UPCOMING_EVENT_STATUSES =
            Set.of("UPCOMING", "REGISTRATION_OPEN", "IN_PROGRESS");
    private static final Set<String> OPEN_OPPORTUNITY_STATUSES =
            Set.of("OPEN", "CLOSING_SOON");

    private final PublicContentService contentService;
    private final ProjectAdminService projectAdminService;

    @Cacheable(cacheNames = "public-home", key = "'home'")
    public HomePublicResponse home() {
        var representation = contentService.representation(null, true, 1, null);
        if (representation.isEmpty()) {
            representation = contentService.representation(null, null, 1, null);
        }
        List<ProjectPublicResponse> publicProjects = projectAdminService.findAllPublic();
        ProjectPublicResponse featuredProject = publicProjects.stream()
                .filter(p -> Boolean.TRUE.equals(p.featured()))
                .findFirst()
                .orElseGet(() -> publicProjects.stream().findFirst().orElse(null));

        var events = contentService.events(null, null, 20, null).stream()
                .filter(item -> UPCOMING_EVENT_STATUSES.contains(item.eventStatus()))
                .sorted((left, right) -> left.startDate().compareTo(right.startDate()))
                .limit(3)
                .toList();
        var opportunities = contentService.opportunities(null, null, 20, null).stream()
                .filter(item -> OPEN_OPPORTUNITY_STATUSES.contains(item.opportunityStatus()))
                .limit(3)
                .toList();
        var team = contentService.team(4, null);
        var statistics = contentService.statistics(20);

        return new HomePublicResponse(
                representation.stream().findFirst().orElse(null),
                featuredProject,
                events,
                opportunities,
                team,
                statistics
        );
    }
}
