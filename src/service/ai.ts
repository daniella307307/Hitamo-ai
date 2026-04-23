import api from "../lib/api";

type ServiceError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

function handleAiError(err: any): never {
  const error = err?.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;
  serviceError.status = err?.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;
  throw serviceError;
}

export interface AiAnalysis {
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
  fitScore?: number;
  summary?: string;
  [key: string]: unknown;
}

export interface RankedCandidate {
  applicationId: string;
  candidateId: string;
  aiScore: number;
  aiAnalysis?: AiAnalysis;
  tokensConsumed?: number;
}

export interface ScreenJobResult {
  jobId: string;
  screened: number;
  tokensConsumed: number;
  rankedCandidates: RankedCandidate[];
  screenedAt?: string;
}

export const aiService = {
  async screenJobApplicants(jobId: string, params?: { mode?: "platform" | "custom" }): Promise<ScreenJobResult> {
    try {
      const { data } = await api.post(`/ai/screen/job/${jobId}`, undefined, {
        params: {
          mode: params?.mode ?? undefined,
        },
      });
      return data?.data;
    } catch (error) {
      handleAiError(error);
      throw error;
    }
  },
};

