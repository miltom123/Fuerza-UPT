import type { Metadata } from "next";
import { OpportunitiesCatalog } from "@/components/content/opportunities-catalog";
import { getOpportunities } from "@/services/opportunity-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Becas y oportunidades | Fuerza UPT",
  description: "Convocatorias, programas internacionales, becas y oportunidades para estudiantes.",
};

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  return <OpportunitiesCatalog opportunities={opportunities.filter((item) => item.status !== "ARCHIVED")} />;
}
