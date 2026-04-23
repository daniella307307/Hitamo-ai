// src/services/jobService.ts
import api from "../lib/api";

type ServiceError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

function handleJobError(err: any): never {
  const error = err.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;

  serviceError.status = err.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;

  if (error?.error?.code === "UNAUTHORIZED") {
    localStorage.clear();
    window.location.href = "/login";
    serviceError.message = "Session expired. Please login again.";
    throw serviceError;
  }

  if (error?.error?.code === "SUBSCRIPTION_REQUIRED") {
    serviceError.message = "Active subscription required.";
    throw serviceError;
  }

  if (error?.error?.code === "VALIDATION_ERROR") {
    serviceError.message =
      error.error.details
        ?.map((detail: any) => `${detail.field}: ${detail.message}`)
        .join(", ") || error.error.message;

    throw serviceError;
  }

  throw serviceError;
}

export type JobStatus = "active" | "draft" | "paused" | "closed" | "archived";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";

export interface Job {
  _id: string;
  id?: string;
  jobId?: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  location: string;
  isRemote: boolean;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  organizationId: string;
  postedBy: string;
  status: JobStatus;
  applicationDeadline?: string;
  aiScreeningEnabled: boolean;
  aiScreeningCriteria?: string;
  pipelineStages: string[];
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedJobs {
  items: Job[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BulkJobActionResult {
  affectedCount?: number;
  affected?: number;
  items?: Job[];
  [key: string]: unknown;
}

const normalizeJob = (payload: any): Job => ({
  ...payload,
  _id: payload?._id ?? payload?.id ?? payload?.jobId ?? "",
  id: payload?.id ?? payload?._id ?? payload?.jobId ?? "",
  jobId: payload?.jobId ?? payload?.id ?? payload?._id ?? "",
  requirements: Array.isArray(payload?.requirements) ? payload.requirements : [],
  responsibilities: Array.isArray(payload?.responsibilities) ? payload.responsibilities : [],
  skills: Array.isArray(payload?.skills) ? payload.skills : [],
  pipelineStages: Array.isArray(payload?.pipelineStages) ? payload.pipelineStages : [],
  applicationCount: typeof payload?.applicationCount === "number" ? payload.applicationCount : 0,
  viewCount: typeof payload?.viewCount === "number" ? payload.viewCount : 0,
});

const extractJobCollection = (payload: any): Job[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.jobs)
          ? payload.jobs
          : [];

  return source.map(normalizeJob);
};

const extractJob = (payload: any): Job => normalizeJob(payload?.data ?? payload);

export const getJobIdentifiers = (
  jobOrId: Partial<Job> | string | null | undefined
): string[] => {
  if (!jobOrId) return [];

  if (typeof jobOrId === "string") {
    return jobOrId ? [jobOrId] : [];
  }

  return Array.from(
    new Set(
      [jobOrId._id, jobOrId.id, jobOrId.jobId]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    )
  );
};

export const jobService = {
  async getJobs(params?: {
    page?: number;
    limit?: number;
    status?: JobStatus | "";
    search?: string;
  }): Promise<PaginatedJobs> {
    try {
      const { data } = await api.get("/jobs", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          status: params?.status ?? "",
          search: params?.search ?? "",
        },
      });

      const items = extractJobCollection(data);

      return {
        items,
        page: data?.meta?.page ?? 1,
        limit: data?.meta?.limit ?? params?.limit ?? 20,
        total: data?.meta?.total ?? data?.totalCount ?? items.length,
        totalPages: data?.meta?.pages ?? data?.meta?.totalPages ?? 1,
      };
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },

  async createJob(job: {
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    skills: string[];
    location: string;
    isRemote: boolean;
    employmentType: EmploymentType;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    applicationDeadline?: string;
    aiScreeningEnabled?: boolean;
    aiScreeningCriteria?: string;
    pipelineStages?: string[];
  }): Promise<Job> {
    try {
      const payload = {
        ...job,
        currency: job.currency ?? "USD",
        aiScreeningEnabled: job.aiScreeningEnabled ?? false,
        pipelineStages: job.pipelineStages ?? [],
      };

      const { data } = await api.post("/jobs", payload);
      return extractJob(data);
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },

  async getJobById(id: string): Promise<Job> {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return extractJob(data);
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },

  async updateJob(id: string, job: {
    title?: string;
    description?: string;
    requirements?: string[];
    responsibilities?: string[];
    skills?: string[];
    location?: string;
    isRemote?: boolean;
    employmentType?: EmploymentType;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    applicationDeadline?: string;
    aiScreeningEnabled?: boolean;
    aiScreeningCriteria?: string;
    pipelineStages?: string[];
  }): Promise<Job> {
    try {
      const { data } = await api.put(`/jobs/${id}`, job);
      return extractJob(data);
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      const { data } = await api.patch(`/jobs/${id}/status`, { status });
      return extractJob(data);
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  },

  async bulkAction(
    ids: string | string[],
    action: string
  ): Promise<BulkJobActionResult> {
    try {
      const jobIds = Array.isArray(ids) ? ids : [ids];

      if (!jobIds.length) {
        throw new Error("At least one job id is required.");
      }

      if (!action.trim()) {
        throw new Error("Action is required.");
      }

      const { data } = await api.post("/jobs/bulk", {
        jobIds,
        action,
      });

      return data.data;
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  }
};
