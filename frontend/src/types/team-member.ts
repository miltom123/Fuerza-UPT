export type TeamCategory =
  | "DIRECTIVA"
  | "REPRESENTANTE"
  | "COORDINACION"
  | "VOLUNTARIADO"
  | "ALIADO";

export type TeamMemberStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type TeamSocialPlatform = "INSTAGRAM" | "LINKEDIN" | "FACEBOOK" | "TWITTER";

export interface TeamSocialLink {
  platform: TeamSocialPlatform;
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  career: string;
  description: string;
  location?: string;
  email?: string;
  imageUrl: string;
  socialLinks: TeamSocialLink[];
}

export interface TeamMemberImage {
  id: string;
  fileName: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  bucketName: string;
  url: string;
  privateAsset: boolean;
  createdAt: string;
}

export interface TeamMemberAdmin {
  id: string;
  name: string;
  role: string;
  career: string;
  description: string;
  category: TeamCategory;
  location?: string;
  email?: string;
  notificationEmail?: string;
  receiveApplications: boolean;
  image?: TeamMemberImage;
  socialLinks: TeamSocialLink[];
  status: TeamMemberStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TeamMemberMutation {
  name: string;
  role: string;
  career: string;
  description: string;
  category: TeamCategory;
  location?: string;
  email?: string;
  notificationEmail?: string;
  receiveApplications?: boolean;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface TeamMemberCreate extends TeamMemberMutation {
  publishNow: boolean;
}

export interface TeamMemberUpdate extends TeamMemberMutation {
  status: TeamMemberStatus;
  version: number;
}
