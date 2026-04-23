import api from "../lib/api";

type ServiceError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

function handleAdminError(err: any): never {
  const error = err?.response?.data;
  const serviceError = new Error(error?.error?.message || "Unexpected error") as ServiceError;
  serviceError.status = err?.response?.status;
  serviceError.code = error?.error?.code;
  serviceError.details = error?.error?.details;
  throw serviceError;
}

export interface AdminStats {
  totalUsers: number;
  activeOrgs: number;
  totalJobs: number;
  totalApplications: number;
  activeSubscriptions: number;
}

export interface AdminUser {
  _id: string;
  id?: string;
  name?: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  organizationId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  success?: boolean;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      const { data } = await api.get("/admin/stats");
      return data?.data ?? {
        totalUsers: 0,
        activeOrgs: 0,
        totalJobs: 0,
        totalApplications: 0,
        activeSubscriptions: 0,
      };
    } catch (error) {
      handleAdminError(error);
      throw error;
    }
  },

  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminUser>> {
    try {
      const { data } = await api.get("/admin/users", {
        params: {
          role: params?.role ?? "",
          status: params?.status ?? "",
          search: params?.search ?? "",
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      });

      const items = (Array.isArray(data?.data) ? data.data : []).map((user: any) => ({
        ...user,
        _id: user?._id ?? user?.id ?? "",
      }));

      return {
        items,
        page: data?.meta?.page ?? 1,
        limit: data?.meta?.limit ?? params?.limit ?? 20,
        total: data?.meta?.total ?? items.length,
        totalPages: data?.meta?.pages ?? 1,
      };
    } catch (error) {
      handleAdminError(error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: string): Promise<void> {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
    } catch (error) {
      handleAdminError(error);
      throw error;
    }
  },

  async getAuditLogs(params?: {
    actorId?: string;
    organizationId?: string;
    resourceType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    try {
      const { data } = await api.get("/admin/audit-logs", {
        params: {
          actorId: params?.actorId ?? "",
          organizationId: params?.organizationId ?? "",
          resourceType: params?.resourceType ?? "",
          action: params?.action ?? "",
          startDate: params?.startDate ?? "",
          endDate: params?.endDate ?? "",
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
        },
      });

      const items = Array.isArray(data?.data) ? data.data : [];

      return {
        items,
        page: data?.meta?.page ?? 1,
        limit: data?.meta?.limit ?? params?.limit ?? 50,
        total: data?.meta?.total ?? items.length,
        totalPages: data?.meta?.pages ?? 1,
      };
    } catch (error) {
      handleAdminError(error);
      throw error;
    }
  },
};
