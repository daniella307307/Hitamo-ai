import api from "../lib/api";

type ServiceError = Error & { status?: number; code?: string; details?: unknown };

function handlePlanError(err: any): never {
  const error = err?.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;
  serviceError.status = err?.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;
  throw serviceError;
}

export interface Plan {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxJobs: number;
  maxRecruiters: number;
  maxCandidatesPerMonth: number;
  includedTokens: number;
  tokenPricePerUnit: number;
  canUseCustomAI: boolean;
  canAccessBulkOps: boolean;
  canAccessIntegrationAPI: boolean;
  canAccessAdvancedAnalytics: boolean;
  sortOrder: number;
}

export interface PlanPayload {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  currency?: string;
  maxJobs?: number;
  maxRecruiters?: number;
  maxCandidatesPerMonth?: number;
  includedTokens?: number;
  tokenPricePerUnit?: number;
  canUseCustomAI?: boolean;
  canAccessBulkOps?: boolean;
  canAccessIntegrationAPI?: boolean;
  canAccessAdvancedAnalytics?: boolean;
  sortOrder?: number;
}

export const planService = {
  async listPublicPlans(): Promise<Plan[]> {
    try {
      const { data } = await api.get("/plans");
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      handlePlanError(error);
      throw error;
    }
  },

  async listAllPlans(): Promise<Plan[]> {
    try {
      const { data } = await api.get("/plans/all");
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.data?.items)) return data.data.items;
      return [];
    } catch (error) {
      handlePlanError(error);
      throw error;
    }
  },

  async createPlan(payload: PlanPayload): Promise<Plan> {
    try {
      const { data } = await api.post("/plans", payload);
      return data?.data;
    } catch (error) {
      handlePlanError(error);
      throw error;
    }
  },

  async updatePlan(planId: string, payload: Partial<PlanPayload>): Promise<Plan> {
    try {
      const { data } = await api.put(`/plans/${planId}`, payload);
      return data?.data;
    } catch (error) {
      handlePlanError(error);
      throw error;
    }
  },

  async deactivatePlan(planId: string): Promise<void> {
    try {
      await api.delete(`/plans/${planId}`);
    } catch (error) {
      handlePlanError(error);
      throw error;
    }
  },
};

