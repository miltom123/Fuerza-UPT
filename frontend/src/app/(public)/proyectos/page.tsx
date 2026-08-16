import type { Metadata } from "next";
import { ProjectsCatalog } from "@/components/content/projects-catalog";
import { getEvents } from "@/services/event-service";
import { getProjects } from "@/services/project-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Proyectos | Fuerza UPT",
  description: "Programas e iniciativas concretas impulsadas por Fuerza UPT.",
};

export default async function ProjectsPage() {
  const [projects, events] = await Promise.all([getProjects(), getEvents()]);
  return <ProjectsCatalog projects={projects.filter((project) => project.status === "PUBLISHED")} events={events} />;
}
