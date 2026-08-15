import type { Event } from "@/types";
import { apiClient } from "./api-client";

export async function getEvents(): Promise<Event[]> {
  try {
    return await apiClient<Event[]>("/eventos", { next: { revalidate: 300, tags: ["events"] } });
  } catch {
    return [];
  }
}
