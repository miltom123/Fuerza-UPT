package pe.edu.upt.fuerzaupt.content.dto;

import pe.edu.upt.fuerzaupt.project.dto.ProjectPublicResponse;

import java.util.List;

public record HomePublicResponse(
        RepresentationPublicResponse featuredRepresentation,
        ProjectPublicResponse featuredProject,
        List<EventPublicResponse> upcomingEvents,
        List<OpportunityPublicResponse> openOpportunities,
        List<TeamMemberPublicResponse> teamMembers,
        List<StatisticPublicResponse> statistics
) {
}
