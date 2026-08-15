import type { RepresentationItem } from "@/types";
import { apiClient } from "./api-client";

export async function getRepresentationItems(): Promise<RepresentationItem[]> {
  try {
    return await apiClient<RepresentationItem[]>("/representacion", { next: { revalidate: 300, tags: ["representation"] } });
  } catch {
    return [];
  }
}
