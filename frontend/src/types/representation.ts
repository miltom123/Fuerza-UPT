import type { BaseContent } from "./common";

export type RepresentationKind =
  | "GESTION"
  | "PROPUESTA"
  | "ACUERDO"
  | "LOGRO"
  | "SEGUIMIENTO"
  | "PRONUNCIAMIENTO"
  | "ASAMBLEA";

export type RepresentationProgress =
  | "PRESENTADO"
  | "EN_EVALUACION"
  | "APROBADO"
  | "EN_SEGUIMIENTO"
  | "LOGRADO"
  | "CERRADO";

export interface RepresentationItem extends BaseContent {
  kind: RepresentationKind;
  progress: RepresentationProgress;
  beneficiaryArea: string;
  identifiedProblem?: string;
  proposalOrManagement: string;
  actionsTaken: string[];
  result?: string;
  evidenceUrls: string[];
  progressPercentage?: number;
  impactLevel?: "ALTO" | "MEDIO" | "BAJO";
  relatedProjectId?: string;
  relatedEventId?: string;
  relatedOpportunityId?: string;
}
