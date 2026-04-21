// src/context/AuthContext.tsx
import React, { createContext, useState } from 'react'
import { authService } from '../service/auth.ts'

// Define types
interface User {
  email: string
  role: 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN'
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  register: (firstName: string, lastName: string, email: string, password: string, phone: string) => Promise<User>
  passwordReset:(email: string) => Promise<void>
  resetPassword:(token: string, newPassword: string) => Promise<void>
  role: string | null
  isCandidate: boolean
  isRecruiter: boolean
  isOrgOwner: boolean
  isAdmin: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const role = user?.role ?? null

  const login = async (email: string, password: string): Promise<User> => {
    const userData = await authService.login(email, password)
    setUser(userData)
    return userData
  }
  const register = async (firstName: string, lastName: string, email: string, password: string, phone: string): Promise<User> => {
    const userData = await authService.register(firstName, lastName, email, password)
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

  const isCandidate = role === 'CANDIDATE'
  const isRecruiter = role === 'RECRUITER'
  const isOrgOwner = role === 'ORG_OWNER'
  const isAdmin = role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, role, isCandidate, isRecruiter, isOrgOwner, isAdmin, passwordReset, resetPassword }}>
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