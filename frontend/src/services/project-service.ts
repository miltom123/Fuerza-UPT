import type { Project } from "@/types";
import { apiClient } from "./api-client";

export async function getProjects(): Promise<Project[]> {
  try {
    return await apiClient<Project[]>("/proyectos", { next: { revalidate: 300, tags: ["projects"] } });
  } catch {
    return [];
  }
}

export async function getProjectById(idOrSlug: string): Promise<Project | null> {
  try {
    return await apiClient<Project>(`/proyectos/${idOrSlug}`, {
      next: { revalidate: 300, tags: [`project-${idOrSlug}`, "projects"] },
    });
  } catch {
    const projects = await getProjects();
    return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
  }
}
