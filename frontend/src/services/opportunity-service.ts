import type { Opportunity } from "@/types";
import { apiClient } from "./api-client";

export async function getOpportunities(): Promise<Opportunity[]> {
  try {
    return await apiClient<Opportunity[]>("/oportunidades", { next: { revalidate: 300, tags: ["opportunities"] } });
  } catch {
    return [];
  }
}
