package pe.edu.upt.fuerzaupt.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.dto.AdminDashboardResponse;
import pe.edu.upt.fuerzaupt.event.repository.EventRegistrationRepository;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;
import pe.edu.upt.fuerzaupt.opportunity.repository.OpportunityRepository;
import pe.edu.upt.fuerzaupt.poll.repository.PollRepository;
import pe.edu.upt.fuerzaupt.project.repository.ProjectRepository;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;
import pe.edu.upt.fuerzaupt.statistic.repository.StatisticRepository;
import pe.edu.upt.fuerzaupt.submission.repository.ContactMessageRepository;
import pe.edu.upt.fuerzaupt.submission.repository.NewsletterSubscriptionRepository;
import pe.edu.upt.fuerzaupt.submission.repository.StudentProposalRepository;
import pe.edu.upt.fuerzaupt.submission.repository.TeamApplicationRepository;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final RepresentationRepository representationRepository;
    private final ProjectRepository projectRepository;
    private final EventRepository eventRepository;
    private final OpportunityRepository opportunityRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final StatisticRepository statisticRepository;
    private final PollRepository pollRepository;

    private final ContactMessageRepository contactMessageRepository;
    private final StudentProposalRepository studentProposalRepository;
    private final TeamApplicationRepository teamApplicationRepository;
    private final NewsletterSubscriptionRepository newsletterSubscriptionRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    private final AdminOperationsService operationsService;

    private static final List<String> PUBLISHED_STATUSES = List.of("PUBLISHED", "SCHEDULED", "OPEN", "CLOSED");

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        Map<String, Long> content = new LinkedHashMap<>();
        content.put("representation", representationRepository.count());
        content.put("projects", projectRepository.count());
        content.put("events", eventRepository.count());
        content.put("opportunities", opportunityRepository.count());
        content.put("team", teamMemberRepository.count());
        content.put("statistics", statisticRepository.count());
        content.put("polls", pollRepository.count());

        long drafts = countByStatus("DRAFT");
        long published = countByStatuses(PUBLISHED_STATUSES);
        long archived = countByStatus("ARCHIVED");

        long pendingValue = countPendingSubmissions();

        return new AdminDashboardResponse(
                content,
                drafts,
                published,
                archived,
                pendingValue,
                operationsService.audit(0, 10).getContent()
        );
    }

    private long countByStatus(String status) {
        return representationRepository.countByContentStatus(status)
                + projectRepository.countByContentStatus(status)
                + eventRepository.countByContentStatus(status)
                + opportunityRepository.countByContentStatus(status)
                + teamMemberRepository.countByContentStatus(status)
                + statisticRepository.countByContentStatus(status)
                + pollRepository.countByStatus(status);
    }

    private long countByStatuses(List<String> statuses) {
        return representationRepository.countByContentStatusIn(statuses)
                + projectRepository.countByContentStatusIn(statuses)
                + eventRepository.countByContentStatusIn(statuses)
                + opportunityRepository.countByContentStatusIn(statuses)
                + teamMemberRepository.countByContentStatusIn(statuses)
                + statisticRepository.countByContentStatusIn(statuses)
                + pollRepository.countByStatusIn(statuses);
    }

    private long countPendingSubmissions() {
        return contactMessageRepository.countByStatus("NEW")
                + studentProposalRepository.countByStatus("NEW")
                + teamApplicationRepository.countByStatus("NEW")
                + newsletterSubscriptionRepository.countByStatus("NEW")
                + eventRegistrationRepository.countByStatus("NEW");
    }
}
