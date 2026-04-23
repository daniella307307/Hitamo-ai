import api from "../lib/api";

type ServiceError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

function handleApplicationError(err: any): never {
  const error = err?.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;

  serviceError.status = err?.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;

  if (error?.error?.code === "UNAUTHORIZED") {
    localStorage.clear();
    window.location.href = "/login";
    serviceError.message = "Session expired. Please login again.";
    throw serviceError;
  }

  throw serviceError;
}

export interface ApplyToJobPayload {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface Application {
  _id: string;
  jobId: string;
  candidateId: string;
  organizationId?: string;
  coverLetter?: string;
  resumeUrl?: string;
  currentStage: string;
  status: string;
  aiScore?: number;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MoveStagePayload {
  stage: string;
  note?: string;
}

export interface BulkMoveStagePayload {
  applicationIds: string[];
  stage: string;
  note?: string;
}

export const applicationService = {
  async listApplications(params?: {
    page?: number;
    limit?: number;
    jobId?: string;
    status?: string;
    search?: string;
  }): Promise<Application[]> {
    try {
      const { data } = await api.get("/applications", {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          jobId: params?.jobId ?? "",
          status: params?.status ?? "",
          search: params?.search ?? "",
        },
      });

      const source = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : [];

      return source.map((item: any) => ({
        ...item,
        _id: item?._id ?? item?.id ?? "",
        jobId: typeof item?.jobId === "string" ? item.jobId : item?.jobId?._id ?? "",
        candidateId: typeof item?.candidateId === "string" ? item.candidateId : item?.candidateId?._id ?? "",
        currentStage: item?.currentStage ?? "Applied",
        status: item?.status ?? "active",
        createdAt: item?.createdAt ?? "",
        updatedAt: item?.updatedAt,
      }));
    } catch (error) {
      handleApplicationError(error);
      throw error;
    }
  },

  async applyToJob(payload: ApplyToJobPayload): Promise<Application> {
    try {
      const { data } = await api.post("/applications/apply", payload);
      return data?.data;
    } catch (error) {
      handleApplicationError(error);
      throw error;
    }
  },

  async moveApplicationToStage(applicationId: string, payload: MoveStagePayload): Promise<Application> {
    try {
      const { data } = await api.patch(`/applications/${applicationId}/stage`, payload);
      return data?.data;
    } catch (error) {
      handleApplicationError(error);
      throw error;
    }
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    try {
      await api.patch(`/applications/${applicationId}/withdraw`);
    } catch (error) {
      handleApplicationError(error);
      throw error;
    }
  },

  async bulkMoveStage(payload: BulkMoveStagePayload): Promise<{ affected?: number; affectedCount?: number }> {
    try {
      const { data } = await api.post("/applications/bulk/stage", payload);
      return data?.data ?? {};
    } catch (error) {
      handleApplicationError(error);
      throw error;
    }
  },
};
