// src/services/jobService.ts
import api from "../lib/api";

function handleJobError(err: any): never {
  const error = err.response?.data;

  // 🔴 401 Unauthorized
  if (error?.error?.code === "UNAUTHORIZED") {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  // 🔴 402 Subscription required
  if (error?.error?.code === "SUBSCRIPTION_REQUIRED") {
    throw new Error("Active subscription required.");
  }

  // 🔴 422 Validation error
  if (error?.error?.code === "VALIDATION_ERROR") {
    const messages =
      error.error.details
        ?.map((d: any) => `${d.field}: ${d.message}`)
        .join(", ") || error.error.message;

    throw new Error(messages);
  }

  throw new Error(error?.error?.message || "Unexpected error");
}
/* ----------------------------- TYPES ----------------------------- */


export type JobStatus = "active" | "draft" | "closed";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";

export interface Job {
  _id: string;
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
  items?: Job[];
  [key: string]: unknown;
}

/* ----------------------------- SERVICE ----------------------------- */

export const jobService = {
  /**
   * GET /jobs
   */
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

      return data.data;
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },

  /**
   * POST /jobs
   */
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

      return data.data;
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },

  /**
   * GET /jobs/:id
   */
  async getJobById(id: string): Promise<Job> {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data.data;
    } catch (err: any) {
      handleJobError(err);
      throw err;
    }
  },
  /**
   * PUT /jobs/:id
   */
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
      return data.data;
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  },
  /**
   * UPDATE job status
   */
  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      const { data } = await api.put(`/jobs/${id}`, { status });
      return data.data;
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  },
  /**
   * BUlk action on jobs
   * @param array of job ids
   * @param action
   */
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

      const { data } = await api.post("/jobs/bulk-action", {
        ids: jobIds,
        action,
      });

      return data.data;
    } catch (error) {
      handleJobError(error);
      throw error;
    }
  }

};
