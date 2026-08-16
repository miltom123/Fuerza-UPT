export interface StoryAdminResponse {
  id: string;
  slug: string;
  authorName: string;
  authorCareer: string;
  category: string;
  quote: string;
  fullStory?: string;
  imageUrl?: string;
  videoUrl?: string;
  featuredInHero: boolean;
  contentStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  displayOrder: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface StoryAdminRequest {
  authorName: string;
  authorCareer: string;
  slug?: string;
  category?: string;
  quote: string;
  fullStory?: string;
  imageUrl?: string;
  videoUrl?: string;
  featuredInHero?: boolean;
  contentStatus?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  displayOrder?: number;
}

export interface StoryPublicResponse {
  id: string;
  slug: string;
  authorName: string;
  authorCareer: string;
  category: string;
  quote: string;
  fullStory?: string;
  imageUrl?: string;
  videoUrl?: string;
  featuredInHero: boolean;
  displayOrder: number;
  publishedAt?: string;
}
