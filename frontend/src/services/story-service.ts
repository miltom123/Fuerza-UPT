import type { StoryPublicResponse } from "@/types/story";
import { apiClient } from "./api-client";

export async function getPublicStories(category?: string, limit = 20): Promise<StoryPublicResponse[]> {
  try {
    let url = `/historias?limit=${limit}`;
    if (category && category !== "Todas las categorías") {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return await apiClient<StoryPublicResponse[]>(url, {
      next: { revalidate: 180, tags: ["stories", "representation"] },
    });
  } catch {
    return [];
  }
}

export async function getHeroStories(): Promise<StoryPublicResponse[]> {
  try {
    return await apiClient<StoryPublicResponse[]>("/historias/hero", {
      next: { revalidate: 180, tags: ["stories", "representation"] },
    });
  } catch {
    return [];
  }
}
