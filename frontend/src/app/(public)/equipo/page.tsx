import type { Metadata } from "next";
import { TeamDirectory } from "@/components/team/team-directory";
import { getTeamMembers } from "@/services/team-service";

export const metadata: Metadata = {
  title: "Equipo Fuerza UPT",
  description: "Conoce a los integrantes confirmados de la comunidad Fuerza UPT.",
};

export default async function TeamPage() {
  const members = await getTeamMembers();
  return <TeamDirectory members={members} />;
}
