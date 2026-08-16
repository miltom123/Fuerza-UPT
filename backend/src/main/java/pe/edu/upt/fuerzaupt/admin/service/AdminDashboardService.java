package pe.edu.upt.fuerzaupt.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.admin.dto.AdminDashboardResponse;
import pe.edu.upt.fuerzaupt.analytics.dto.DailyVisitStat;
import pe.edu.upt.fuerzaupt.analytics.dto.SubmissionsSummary;
import pe.edu.upt.fuerzaupt.analytics.service.AnalyticsService;
import pe.edu.upt.fuerzaupt.event.repository.EventRegistrationRepository;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;
import pe.edu.upt.fuerzaupt.opportunity.repository.OpportunityRepository;
import pe.edu.upt.fuerzaupt.poll.repository.PollRepository;
import pe.edu.upt.fuerzaupt.poll.repository.PollResponseRepository;
import pe.edu.upt.fuerzaupt.project.repository.ProjectRepository;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;
import pe.edu.upt.fuerzaupt.statistic.repository.StatisticRepository;
import pe.edu.upt.fuerzaupt.submission.repository.ContactMessageRepository;
import pe.edu.upt.fuerzaupt.submission.repository.NewsletterSubscriptionRepository;
import pe.edu.upt.fuerzaupt.submission.repository.StudentProposalRepository;
import pe.edu.upt.fuerzaupt.submission.repository.TeamApplicationRepository;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.time.Instant;
import java.time.LocalDate;
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
    private final PollResponseRepository pollResponseRepository;

    private final ContactMessageRepository contactMessageRepository;
    private final StudentProposalRepository studentProposalRepository;
    private final TeamApplicationRepository teamApplicationRepository;
    private final NewsletterSubscriptionRepository newsletterSubscriptionRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    private final AnalyticsService analyticsService;
    private final AdminOperationsService operationsService;

    private static final List<String> PUBLISHED_STATUSES = List.of("PUBLISHED", "SCHEDULED", "OPEN", "CLOSED");

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard(LocalDate fromDate, LocalDate toDate) {
        LocalDate safeFrom = fromDate != null ? fromDate : LocalDate.now(AnalyticsService.LIMA_ZONE).minusDays(6);
        LocalDate safeTo = toDate != null ? toDate : LocalDate.now(AnalyticsService.LIMA_ZONE);

        if (safeFrom.isAfter(safeTo)) {
            LocalDate temp = safeFrom;
            safeFrom = safeTo;
            safeTo = temp;
        }

        Instant start = safeFrom.atStartOfDay(AnalyticsService.LIMA_ZONE).toInstant();
        Instant end = safeTo.plusDays(1).atStartOfDay(AnalyticsService.LIMA_ZONE).toInstant();

        // 1. REAL VISITS AND PAGEVIEWS FROM POSTGRESQL
        long visits = analyticsService.countVisits(safeFrom, safeTo);
        long uniqueVisitors = analyticsService.countUniqueVisitors(safeFrom, safeTo);
        long pageViews = visits; // Each tracked visit is a verified page view
        List<DailyVisitStat> dailyVisits = analyticsService.getDailyVisits(safeFrom, safeTo);

        // 2. REAL SUBMISSIONS BREAKDOWN IN THE PERIOD
        long contacts = contactMessageRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
        long applications = teamApplicationRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
        long proposals = studentProposalRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
        long subscriptions = newsletterSubscriptionRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end);
        long registrations = eventRegistrationRepository.countByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(start, end);
        long pollVotes = pollResponseRepository.countBySubmittedAtGreaterThanEqualAndSubmittedAtLessThan(start, end);

        long submissionsTotal = contacts + applications + proposals + subscriptions + registrations;
        long totalInteractions = submissionsTotal + pollVotes;

        SubmissionsSummary submissionsSummary = new SubmissionsSummary(
                contacts,
                applications,
                proposals,
                subscriptions,
                registrations,
                submissionsTotal
        );

        // 3. REAL CONTENT COUNTS (ONLY ACTIVE PUBLISHED CONTENT)
        Map<String, Long> content = new LinkedHashMap<>();
        content.put("projects", projectRepository.countByContentStatusIn(PUBLISHED_STATUSES));
        content.put("events", eventRepository.countByContentStatusIn(PUBLISHED_STATUSES));
        content.put("representation", representationRepository.countByContentStatusIn(PUBLISHED_STATUSES));
        content.put("opportunities", opportunityRepository.countByContentStatusIn(PUBLISHED_STATUSES));
        content.put("team", teamMemberRepository.countByContentStatusIn(PUBLISHED_STATUSES));
        content.put("polls", pollRepository.countByStatusIn(PUBLISHED_STATUSES));
        content.put("statistics", statisticRepository.countByContentStatusIn(PUBLISHED_STATUSES));

        long drafts = countByStatus("DRAFT");
        long published = countByStatuses(PUBLISHED_STATUSES);
        long archived = countByStatus("ARCHIVED");
        long pendingValue = countPendingSubmissions();

        return new AdminDashboardResponse(
                visits,
                uniqueVisitors,
                pageViews,
                totalInteractions,
                published,
                drafts,
                archived,
                pendingValue,
                dailyVisits,
                submissionsSummary,
                content,
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
