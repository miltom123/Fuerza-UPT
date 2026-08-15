import type { BaseContent } from "./common";

export type ProjectStatus = "UPCOMING" | "ACTIVE" | "PAUSED" | "FINISHED";

export interface ProjectMethodologyStep {
  stepNumber: number;
  title: string;
  description: string;
  iconName?: string;
}

export interface ProjectMilestone {
  id?: string;
  title: string;
  description: string;
  completed?: boolean;
}

export interface ProjectEvidence {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface ProjectStatMetric {
  id?: string;
  icon?: string;
  number: string;
  label: string;
  tag?: string;
}

export interface Project extends BaseContent {
  category: string;
  description: string;
  problem: string;
  objective: string;
  startDate?: string;
  endDate?: string;
  projectStatus: ProjectStatus;
  responsibleNames: string[];
  partnerNames: string[];
  beneficiaries?: string;
  eventIds: string[];
  results: string[];
  gallery?: string[];
  subtitle?: string;
  collaborativeNote?: string;
  overallProgress?: number;
  statMetrics?: ProjectStatMetric[];
  methodology?: ProjectMethodologyStep[];
  milestones?: ProjectMilestone[];
  evidences?: ProjectEvidence[];
  coverAltText?: string;
}
