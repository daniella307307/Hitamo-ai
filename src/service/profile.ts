import api from "../lib/api";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type AvailabilityStatus = "available" | "open" | "not_available";

export interface TalentSkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface TalentExperience {
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string;
  technologies: string[];
}

export interface TalentEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  grade: string;
}

export interface TalentProfile {
  _id: string;
  userId: string;
  headline: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  skills: TalentSkill[];
  experience: TalentExperience[];
  education: TalentEducation[];
  languages: string[];
  availabilityStatus: AvailabilityStatus;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  expectedSalaryCurrency: string;
  isPublic: boolean;
  completionScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTalentProfilePayload {
  headline: string;
  bio: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  skills: TalentSkill[];
  experience: TalentExperience[];
  education: TalentEducation[];
  languages: string[];
  availabilityStatus: AvailabilityStatus;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  expectedSalaryCurrency: string;
  isPublic: boolean;
}

const normalizeProfile = (payload: any): TalentProfile => ({
  _id: payload?._id ?? payload?.id ?? "",
  userId: payload?.userId ?? "",
  headline: payload?.headline ?? "",
  bio: payload?.bio ?? "",
  location: payload?.location ?? "",
  linkedinUrl: payload?.linkedinUrl ?? "",
  githubUrl: payload?.githubUrl ?? "",
  resumeUrl: payload?.resumeUrl ?? "",
  skills: Array.isArray(payload?.skills) ? payload.skills : [],
  experience: Array.isArray(payload?.experience) ? payload.experience : [],
  education: Array.isArray(payload?.education) ? payload.education : [],
  languages: Array.isArray(payload?.languages) ? payload.languages : [],
  availabilityStatus: payload?.availabilityStatus ?? "open",
  expectedSalaryMin: typeof payload?.expectedSalaryMin === "number" ? payload.expectedSalaryMin : 0,
  expectedSalaryMax: typeof payload?.expectedSalaryMax === "number" ? payload.expectedSalaryMax : 0,
  expectedSalaryCurrency: payload?.expectedSalaryCurrency ?? "USD",
  isPublic: Boolean(payload?.isPublic),
  completionScore: typeof payload?.completionScore === "number" ? payload.completionScore : 0,
  createdAt: payload?.createdAt ?? "",
  updatedAt: payload?.updatedAt ?? "",
});

const extractProfile = (payload: any): TalentProfile => normalizeProfile(payload?.data ?? payload);

const buildServiceError = (err: any): never => {
  const response = err?.response?.data;
  const serviceError = new Error(response?.error?.message || "Unexpected error") as Error & {
    status?: number;
    code?: string;
    details?: unknown;
  };

  serviceError.status = err?.response?.status;
  serviceError.code = response?.error?.code;
  serviceError.details = response?.error?.details;
  throw serviceError;
};

export const profileService = {
  async getMyProfile(): Promise<TalentProfile> {
    try {
      const { data } = await api.get("/profile/me");
      return extractProfile(data);
    } catch (err: any) {
      buildServiceError(err);
      throw err;
    }
  },

  async updateMyProfile(profile: UpdateTalentProfilePayload): Promise<TalentProfile> {
    try {
      const { data } = await api.put("/profile/me", profile);
      return extractProfile(data);
    } catch (err: any) {
      buildServiceError(err);
      throw err;
    }
  },

  async getPublicProfile(userId: string): Promise<TalentProfile> {
    try {
      const { data } = await api.get(`/profile/${userId}`);
      return extractProfile(data);
    } catch (err: any) {
      buildServiceError(err);
      throw err;
    }
  },
};
