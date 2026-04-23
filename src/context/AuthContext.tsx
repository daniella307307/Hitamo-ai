// src/context/AuthContext.tsx
import React, { createContext, useState } from 'react'
import { authService, type AuthUser } from '../service/auth.ts'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  register: (firstName: string, lastName: string, email: string, password: string, phone: string) => Promise<AuthUser>
  passwordReset:(email: string) => Promise<void>
  resetPassword:(token: string, newPassword: string) => Promise<void>
  getProfile:(token:string)=>Promise<void>
  role: string | null
  isCandidate: boolean
  isRecruiter: boolean
  isOrgOwner: boolean
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser())
  const role = user?.role ?? null

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const userData = await authService.login(email, password)
    setUser(userData)
    return userData
  }
  const register = async (firstName: string, lastName: string, email: string, password: string, phone: string): Promise<AuthUser> => {
    const userData = await authService.register(firstName, lastName, email, password, phone)
    setUser(userData)
    return userData
  }

  const logout = (): void => {
    authService.logout()
    setUser(null)
  }
  const passwordReset = async (email: string): Promise<void> => {
    await authService.forgot(email)
    setUser(null)
  }
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await authService.resetpassword(token, newPassword)
    setUser(null)
  }
  const getProfile = async(token:string):Promise<void>=>{
    const userData = await authService.getProfile();
    setUser(userData);
  }

  const isCandidate = role === 'CANDIDATE'
  const isRecruiter = role === 'RECRUITER'
  const isOrgOwner = role === 'ORG_OWNER'
  const isAdmin = role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, role, isCandidate, isRecruiter, isOrgOwner,getProfile, isAdmin, passwordReset, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
