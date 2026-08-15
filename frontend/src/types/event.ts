import type { BaseContent } from "./common";

export type EventModality = "ONLINE" | "IN_PERSON" | "HYBRID";
export type EventStatus =
  | "UPCOMING"
  | "REGISTRATION_OPEN"
  | "FULL"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED";

export interface Event extends BaseContent {
  category: string;
  description: string;
  startDate: string;
  endDate?: string;
  time?: string;
  modality: EventModality;
  location?: string;
  organizer: string;
  speakerNames: string[];
  registrationEnabled: boolean;
  registrationUrl?: string;
  capacity?: number;
  eventStatus: EventStatus;
  relatedProjectId?: string;
}
