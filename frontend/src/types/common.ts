export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type MigrationStatus =
  | "KEEP"
  | "MOVE"
  | "MERGE"
  | "VERIFY"
  | "REMOVE_PLACEHOLDER";

export interface BaseContent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  publishedAt?: string;
  updatedAt?: string;
  status: ContentStatus;
  featured: boolean;
  displayOrder: number;
  originalSource?: string;
  migrationStatus?: MigrationStatus;
}
