import type { Event, Opportunity, Project, RepresentationItem, Statistic, TeamMember } from "@/types";

export interface HomeContent {
  featuredRepresentation: RepresentationItem | null;
  featuredProject: Project | null;
  upcomingEvents: Event[];
  openOpportunities: Opportunity[];
  teamMembers: TeamMember[];
  statistics: Statistic[];
}
