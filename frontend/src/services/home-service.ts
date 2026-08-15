import type { HomeContent } from "@/types/home";
import { apiClient } from "./api-client";

const homeTags = [
  "home", "representation", "projects", "events", "opportunities", "team", "statistics",
];

export async function getHomeContent(): Promise<HomeContent> {
  try {
    return await apiClient<HomeContent>("/public/home", {
      next: { revalidate: 300, tags: homeTags },
    });
  } catch {
    return {
      featuredRepresentation: null,
      featuredProject: null,
      upcomingEvents: [],
      openOpportunities: [],
      teamMembers: [],
      statistics: [],
    };
  }
}
