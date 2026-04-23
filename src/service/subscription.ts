import api from "../lib/api";

type ServiceError = Error & { status?: number; code?: string; details?: unknown };

function handleSubscriptionError(err: any): never {
  const error = err?.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;
  serviceError.status = err?.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;
  throw serviceError;
}

export interface SubscriptionPlanRef {
  _id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  includedTokens: number;
  canUseCustomAI: boolean;
  canAccessBulkOps: boolean;
}

export interface Subscription {
  _id: string;
  organizationId: string;
  planId: SubscriptionPlanRef;
  status: string;
  billingCycle: "monthly" | "annual";
  aiUsageMode: "platform" | "custom";
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  tokensUsedThisPeriod?: number;
  tokensIncludedThisPeriod?: number;
  autoRenew?: boolean;
}

export interface PaymentRecord {
  _id: string;
  organizationId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  tokensPurchased?: number;
  externalPaymentId?: string;
  externalProvider?: string;
  createdAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const subscriptionService = {
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const { data } = await api.get("/subscriptions/current");
      return data?.data ?? null;
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },

  async cancelSubscription(reason?: string): Promise<void> {
    try {
      await api.post("/subscriptions/cancel", { reason });
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },

  async initiateSubscription(payload: {
    planId: string;
    billingCycle: "monthly" | "annual";
    aiUsageMode: "platform" | "custom";
    msisdn: string;
  }): Promise<PaymentRecord> {
    try {
      const { data } = await api.post("/subscriptions/initiate", payload);
      return data?.data?.payment ?? data?.data;
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },

  async getPaymentHistory(params?: { page?: number; limit?: number }): Promise<PaginatedResult<PaymentRecord>> {
    try {
      const { data } = await api.get("/subscriptions/payments", {
        params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      });
      const items = Array.isArray(data?.data) ? data.data : [];
      return {
        items,
        page: data?.meta?.page ?? 1,
        limit: data?.meta?.limit ?? params?.limit ?? 20,
        total: data?.meta?.total ?? items.length,
        totalPages: data?.meta?.pages ?? 1,
      };
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },

  async allocateTokens(payload: { candidateId: string; tokenAmount: number; jobId?: string }): Promise<void> {
    try {
      await api.post("/subscriptions/tokens/allocate", payload);
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },

  async purchaseTokens(payload: { tokenAmount: number; msisdn: string }): Promise<PaymentRecord> {
    try {
      const { data } = await api.post("/subscriptions/tokens/purchase", payload);
      return data?.data;
    } catch (error) {
      handleSubscriptionError(error);
      throw error;
    }
  },
};

