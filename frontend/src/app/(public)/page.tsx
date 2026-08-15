import { HomePortal } from "@/components/home/home-portal";
import { getHomeContent } from "@/services/home-service";

export default async function Home() {
  const content = await getHomeContent();

  return <HomePortal
    representationItems={content.featuredRepresentation ? [content.featuredRepresentation] : []}
    projects={content.featuredProject ? [content.featuredProject] : []}
    events={content.upcomingEvents}
    opportunities={content.openOpportunities}
    teamMembers={content.teamMembers}
    statistics={content.statistics}
  />;
}
