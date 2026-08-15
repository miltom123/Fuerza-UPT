package pe.edu.upt.fuerzaupt.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upt.fuerzaupt.common.exception.ResourceNotFoundException;
import pe.edu.upt.fuerzaupt.content.dto.*;
import java.util.Locale;
import pe.edu.upt.fuerzaupt.event.entity.Event;
import pe.edu.upt.fuerzaupt.event.entity.EventSpeaker;
import pe.edu.upt.fuerzaupt.event.repository.EventRepository;
import pe.edu.upt.fuerzaupt.media.entity.MediaAsset;
import pe.edu.upt.fuerzaupt.media.repository.MediaAssetRepository;
import pe.edu.upt.fuerzaupt.opportunity.entity.Opportunity;
import pe.edu.upt.fuerzaupt.opportunity.entity.OpportunityBenefit;
import pe.edu.upt.fuerzaupt.opportunity.entity.OpportunityRequirement;
import pe.edu.upt.fuerzaupt.opportunity.repository.OpportunityRepository;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationAction;
import pe.edu.upt.fuerzaupt.representation.entity.RepresentationItem;
import pe.edu.upt.fuerzaupt.representation.repository.RepresentationRepository;
import pe.edu.upt.fuerzaupt.statistic.entity.Statistic;
import pe.edu.upt.fuerzaupt.statistic.repository.StatisticRepository;
import pe.edu.upt.fuerzaupt.team.entity.TeamMember;
import pe.edu.upt.fuerzaupt.team.repository.TeamMemberRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicContentService {

    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 100;

    private final RepresentationRepository representationRepository;
    private final EventRepository eventRepository;
    private final OpportunityRepository opportunityRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final StatisticRepository statisticRepository;
    private final MediaAssetRepository mediaAssetRepository;

    @Cacheable(cacheNames = "public-representation",
            key = "#progress + ':' + #featured + ':' + #limit + ':' + #cursor")
    public List<RepresentationPublicResponse> representation(
            String progress, Boolean featured, Integer limit, Integer cursor
    ) {
        String cleanProgress = progress != null && !progress.isBlank() ? progress.trim().toUpperCase(Locale.ROOT) : null;
        return representationRepository.findPublicContent(
                cleanProgress, featured, cursor, PageRequest.of(0, safeLimit(limit))
        ).stream().map(this::mapRepresentation).collect(Collectors.toList());
    }

    @Cacheable(cacheNames = "public-representation", key = "'slug:' + #slug")
    public RepresentationPublicResponse representationBySlug(String slug) {
        return representationRepository.findBySlugAndPublished(slug)
                .map(this::mapRepresentation)
                .orElseThrow(() -> new ResourceNotFoundException("Representación no encontrada."));
    }

    @Cacheable(cacheNames = "public-events",
            key = "#modality + ':' + #featured + ':' + #limit + ':' + #cursor")
    public List<EventPublicResponse> events(String modality, Boolean featured, Integer limit, Integer cursor) {
        String safeModality = modality == null || modality.isBlank() ? null : modality.trim().toUpperCase(Locale.ROOT);
        return eventRepository.findPublicContent(
                safeModality, featured, cursor, PageRequest.of(0, safeLimit(limit))
        ).stream().map(this::mapEvent).collect(Collectors.toList());
    }

    @Cacheable(cacheNames = "public-events", key = "'slug:' + #slug")
    public EventPublicResponse eventBySlug(String slug) {
        return eventRepository.findBySlugAndPublished(slug)
                .map(this::mapEvent)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado."));
    }

    @Cacheable(cacheNames = "public-opportunities",
            key = "#opportunityType + ':' + #featured + ':' + #limit + ':' + #cursor")
    public List<OpportunityPublicResponse> opportunities(String opportunityType, Boolean featured, Integer limit, Integer cursor) {
        String safeType = opportunityType == null || opportunityType.isBlank() ? null : opportunityType.trim().toUpperCase(Locale.ROOT);
        return opportunityRepository.findPublicContent(
                safeType, featured, cursor, PageRequest.of(0, safeLimit(limit))
        ).stream().map(this::mapOpportunity).collect(Collectors.toList());
    }

    @Cacheable(cacheNames = "public-opportunities", key = "'slug:' + #slug")
    public OpportunityPublicResponse opportunityBySlug(String slug) {
        return opportunityRepository.findBySlugAndPublished(slug)
                .map(this::mapOpportunity)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidad no encontrada."));
    }

    @Cacheable(cacheNames = "public-team", key = "#limit + ':' + #cursor")
    public List<TeamMemberPublicResponse> team(Integer limit, Integer cursor) {
        return teamMemberRepository.findPublicTeam(cursor, PageRequest.of(0, safeLimit(limit)))
                .stream().map(this::mapTeamMember).collect(Collectors.toList());
    }

    @Cacheable(cacheNames = "public-team", key = "'id:' + #id")
    public TeamMemberPublicResponse teamMember(UUID id) {
        return teamMemberRepository.findPublicById(id)
                .map(this::mapTeamMember)
                .orElseThrow(() -> new ResourceNotFoundException("Miembro de equipo no encontrado."));
    }

    @Cacheable(cacheNames = "public-statistics", key = "#limit == null ? 100 : #limit")
    public List<StatisticPublicResponse> statistics(Integer limit) {
        return statisticRepository.findVerifiedStatistics(PageRequest.of(0, safeLimit(limit)))
                .stream().map(this::mapStatistic).collect(Collectors.toList());
    }

    private int safeLimit(Integer limit) {
        return limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
    }

    private RepresentationPublicResponse mapRepresentation(RepresentationItem r) {
        List<String> evidenceUrls = r.getEvidence() != null ? r.getEvidence().stream()
                .map(ev -> ev.getMediaAssetId() != null ? mediaAssetRepository.findById(ev.getMediaAssetId())
                        .filter(m -> !Boolean.TRUE.equals(m.getPrivateAsset()))
                        .map(MediaAsset::getUrl).orElse(null) : null)
                .filter(url -> url != null && !url.isBlank())
                .toList() : List.of();

        return new RepresentationPublicResponse(
                r.getId(), r.getSlug(), r.getTitle(), r.getSummary(),
                r.getCoverImageUrl(), r.getPublishedAt(), r.getUpdatedAt(),
                r.getContentStatus(), r.getFeatured(), r.getDisplayOrder(),
                r.getKind(),
                r.getProgress() != null ? r.getProgress().toString() : null,
                r.getBeneficiaryArea(), r.getIdentifiedProblem(),
                r.getProposalOrManagement(),
                r.getActions().stream().map(RepresentationAction::getDescription).toList(),
                r.getResult(),
                evidenceUrls,
                r.getProgressPercentage(), r.getImpactLevel(),
                r.getRelatedProjectId(), r.getRelatedEventId(), r.getRelatedOpportunityId()
        );
    }

    private EventPublicResponse mapEvent(Event e) {
        return new EventPublicResponse(
                e.getId(), e.getSlug(), e.getTitle(), e.getSummary(),
                e.getCoverImageUrl(), e.getPublishedAt(), e.getUpdatedAt(),
                e.getContentStatus(), e.getFeatured(), e.getDisplayOrder(),
                e.getCategory(), e.getDescription(),
                e.getStartDate(), e.getEndDate(), e.getEventTime(),
                e.getModality(), e.getLocation(), e.getOrganizer(),
                e.getSpeakers().stream().map(EventSpeaker::getName).toList(),
                e.getRegistrationEnabled(), e.getRegistrationUrl(), e.getCapacity(),
                e.getEventStatus(), e.getProjectId()
        );
    }

    private OpportunityPublicResponse mapOpportunity(Opportunity o) {
        return new OpportunityPublicResponse(
                o.getId(), o.getSlug(), o.getTitle(), o.getSummary(),
                o.getCoverImageUrl(), o.getPublishedAt(), o.getUpdatedAt(),
                o.getContentStatus(), o.getFeatured(), o.getDisplayOrder(),
                o.getOpportunityType(), o.getInstitution(),
                o.getDescription(),
                o.getBenefits().stream().map(OpportunityBenefit::getDescription).toList(),
                o.getRequirements().stream().map(OpportunityRequirement::getDescription).toList(),
                o.getDeadline(), o.getCountryOrModality(), o.getOfficialUrl(),
                o.getApplicationUrl(), o.getOpportunityStatus()
        );
    }

    private TeamMemberPublicResponse mapTeamMember(TeamMember t) {
        String imageUrl = t.getImageMediaId() != null
                ? mediaAssetRepository.findById(t.getImageMediaId()).map(MediaAsset::getUrl).orElse(null)
                : null;

        return new TeamMemberPublicResponse(
                t.getId(), t.getName(), t.getRole(), t.getCareer(),
                t.getDescription(), t.getLocation(), t.getEmail(),
                imageUrl,
                t.getSocialLinks().stream().map(l -> new TeamSocialLinkResponse(l.getPlatform(), l.getUrl())).toList()
        );
    }

    private StatisticPublicResponse mapStatistic(Statistic s) {
        return new StatisticPublicResponse(
                s.getStatKey(), s.getValue(), s.getLabel(),
                s.getIsVerified(), s.getSource(), s.getUpdatedAt()
        );
    }
}
