import type { TeamMember } from "@/types";
import { apiClient } from "./api-client";

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    return await apiClient<TeamMember[]>("/equipo", { next: { revalidate: 1800, tags: ["team"] } });
  } catch {
    return [];
  }
}
