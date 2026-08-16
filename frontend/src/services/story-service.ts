import type { StoryPublicResponse } from "@/types/story";
import { apiClient } from "./api-client";

export async function getPublicStories(category?: string, limit = 50): Promise<StoryPublicResponse[]> {
  try {
    let url = `/historias?limit=${limit}`;
    if (
      category &&
      category !== "Todas las categorías" &&
      category !== "Todas las categorias" &&
      category !== "ALL"
    ) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    return await apiClient<StoryPublicResponse[]>(url, {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}

export async function getHeroStories(): Promise<StoryPublicResponse[]> {
  try {
    return await apiClient<StoryPublicResponse[]>("/historias/hero", {
      cache: "no-store",
    });
  } catch {
    return [];
  }
}
