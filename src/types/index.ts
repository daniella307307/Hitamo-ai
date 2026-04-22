export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN'
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
