import { apiClient } from "../api-client";
import type { Opportunity, OpportunityType, OpportunityStatus } from "@/types/opportunity";

export interface OpportunityAdminRequest {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  displayOrder: number;
  category: OpportunityType; // Maps to opportunityType
  institution?: string;
  description?: string;
  endDate?: string; // Maps to deadline
  modality?: string; // Maps to countryOrModality
  domainStatus?: OpportunityStatus; // Maps to opportunityStatus
  officialUrl?: string;
  applicationUrl?: string;
  proposalOrManagement?: string; // Benefits newline separated
  result?: string; // Requirements newline separated
  version?: number;
}

export interface OpportunityAdminItem extends Opportunity {
  version?: number;
}

export const opportunityAdminService = {
  async getAll(): Promise<OpportunityAdminItem[]> {
    try {
      // In public or content admin, we fetch all opportunities
      const res = await apiClient<OpportunityAdminItem[]>("/oportunidades", {
        cache: "no-store",
      });
      return res || [];
    } catch {
      return [];
    }
  },

  async create(data: OpportunityAdminRequest): Promise<void> {
    await apiClient("/admin/content/opportunities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: OpportunityAdminRequest): Promise<void> {
    await apiClient(`/admin/content/opportunities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async archive(id: string): Promise<void> {
    await apiClient(`/admin/content/opportunities/${id}`, {
      method: "DELETE",
    });
  },

  async restore(id: string, version = 0): Promise<void> {
    await apiClient(`/admin/content/opportunities/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "PUBLISHED",
        version,
      }),
    });
  },

  async deletePermanent(id: string): Promise<void> {
    await apiClient(`/admin/content/opportunities/${id}/permanent`, {
      method: "DELETE",
    });
  },
};
