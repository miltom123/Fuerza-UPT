package pe.edu.upt.fuerzaupt.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upt.fuerzaupt.content.dto.*;
import pe.edu.upt.fuerzaupt.content.service.PublicContentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PublicContentController {

    private final PublicContentService contentService;

    @GetMapping("/api/representacion")
    public List<RepresentationPublicResponse> representation(
            @RequestParam(required = false) String progress,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer cursor
    ) {
        return contentService.representation(progress, featured, limit, cursor);
    }

    @GetMapping("/api/representacion/{slug}")
    public RepresentationPublicResponse representationBySlug(@PathVariable String slug) {
        return contentService.representationBySlug(slug);
    }

    @GetMapping("/api/eventos")
    public List<EventPublicResponse> events(
            @RequestParam(required = false) String modality,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer cursor
    ) {
        return contentService.events(modality, featured, limit, cursor);
    }

    @GetMapping("/api/eventos/{slug}")
    public EventPublicResponse eventBySlug(@PathVariable String slug) {
        return contentService.eventBySlug(slug);
    }

    @GetMapping("/api/oportunidades")
    public List<OpportunityPublicResponse> opportunities(
            @RequestParam(name = "type", required = false) String opportunityType,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer cursor
    ) {
        return contentService.opportunities(opportunityType, featured, limit, cursor);
    }

    @GetMapping("/api/oportunidades/{slug}")
    public OpportunityPublicResponse opportunityBySlug(@PathVariable String slug) {
        return contentService.opportunityBySlug(slug);
    }

    @GetMapping("/api/equipo")
    public List<TeamMemberPublicResponse> team(
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer cursor
    ) {
        return contentService.team(limit, cursor);
    }

    @GetMapping("/api/equipo/{id}")
    public TeamMemberPublicResponse teamMember(@PathVariable UUID id) {
        return contentService.teamMember(id);
    }

    @GetMapping("/api/estadisticas")
    public List<StatisticPublicResponse> statistics(@RequestParam(required = false) Integer limit) {
        return contentService.statistics(limit);
    }
}
