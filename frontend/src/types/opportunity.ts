import type { BaseContent } from "./common";

export type OpportunityType =
  | "SCHOLARSHIP"
  | "EXCHANGE"
  | "INTERNATIONAL_PROGRAM"
  | "VOLUNTEERING"
  | "CONTEST"
  | "INTERNSHIP"
  | "EXTERNAL_COURSE"
  | "CALL";

export type OpportunityStatus =
  | "COMING_SOON"
  | "OPEN"
  | "CLOSING_SOON"
  | "CLOSED"
  | "RESULTS_PUBLISHED";

export interface Opportunity extends BaseContent {
  opportunityType: OpportunityType;
  institution: string;
  description: string;
  benefits: string[];
  requirements: string[];
  deadline?: string;
  countryOrModality?: string;
  officialUrl?: string;
  applicationUrl?: string;
  opportunityStatus: OpportunityStatus;
}
