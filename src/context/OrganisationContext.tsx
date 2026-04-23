import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import api from '../lib/api'

type OrgStatus = 'active' | 'suspended' | 'closed' | string
type OrgRole = 'OWNER' | 'RECRUITER' | string

export interface OrganizationMember {
  userId: string
  orgRole: OrgRole
  permissions: string[]
  addedBy?: string
  addedAt?: string
}

export interface Organization {
  _id: string
  name: string
  slug?: string
  description?: string
  website?: string
  industry?: string
  ownerId?: string | { _id: string; name?: string; email?: string }
  members: OrganizationMember[]
  status: OrgStatus
  tokenBalance?: number
  subscriptionId?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrganizationRequestPayload {
  organizationName: string
  description?: string
  website?: string
  industry?: string
}

export interface AddMemberPayload {
  userId: string
  orgRole?: 'RECRUITER' | string
  permissions?: string[]
}

export interface SetCustomAiConfigPayload {
  provider: 'openai' | string
  apiKey: string
  modelName: string
}

interface OrganisationContextType {
  organization: Organization | null
  loading: boolean
  refreshMyOrganization: () => Promise<Organization | null>
  requestOrganizationCreation: (payload: OrganizationRequestPayload) => Promise<void>
  listOrganizationRequests: (params?: { status?: string; page?: number; limit?: number }) => Promise<unknown>
  approveOrganizationRequest: (requestId: string) => Promise<Organization>
  rejectOrganizationRequest: (requestId: string, reason?: string) => Promise<void>
  addOrganizationMember: (organizationId: string, payload: AddMemberPayload) => Promise<void>
  removeOrganizationMember: (organizationId: string, userId: string) => Promise<void>
  regenerateOrganizationApiKey: (organizationId: string) => Promise<string>
  setOrganizationAiConfig: (organizationId: string, payload: SetCustomAiConfigPayload) => Promise<void>
  suspendOrganization: (organizationId: string, reason: string) => Promise<void>
  closeOrganization: (organizationId: string, reason: string) => Promise<void>
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined)

const extractData = <T,>(response: { data?: { data?: T } }): T | null => {
  return response?.data?.data ?? null
}

export const OrganisationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshMyOrganization = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/organizations/me')
      const data = extractData<Organization>(response)
      setOrganization(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const requestOrganizationCreation = useCallback(async (payload: OrganizationRequestPayload) => {
    await api.post('/organizations/request', payload)
  }, [])

  const listOrganizationRequests = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/organizations/requests', { params })
    return response.data?.data ?? response.data
  }, [])

  const approveOrganizationRequest = useCallback(async (requestId: string) => {
    const response = await api.post(`/organizations/requests/${requestId}/approve`)
    const data = extractData<Organization>(response)
    if (data) setOrganization(data)
    return data as Organization
  }, [])

  const rejectOrganizationRequest = useCallback(async (requestId: string, reason?: string) => {
    await api.post(`/organizations/requests/${requestId}/reject`, { reason })
  }, [])

  const addOrganizationMember = useCallback(async (organizationId: string, payload: AddMemberPayload) => {
    await api.post(`/organizations/${organizationId}/members`, payload)
    await refreshMyOrganization()
  }, [refreshMyOrganization])

  const removeOrganizationMember = useCallback(async (organizationId: string, userId: string) => {
    await api.delete(`/organizations/${organizationId}/members/${userId}`)
    await refreshMyOrganization()
  }, [refreshMyOrganization])

  const regenerateOrganizationApiKey = useCallback(async (organizationId: string) => {
    const response = await api.post(`/organizations/${organizationId}/api-key/regenerate`)
    return response?.data?.data?.integrationApiKey ?? ''
  }, [])

  const setOrganizationAiConfig = useCallback(async (organizationId: string, payload: SetCustomAiConfigPayload) => {
    await api.put(`/organizations/${organizationId}/ai-config`, payload)
  }, [])

  const suspendOrganization = useCallback(async (organizationId: string, reason: string) => {
    await api.post(`/organizations/${organizationId}/suspend`, { reason })
    await refreshMyOrganization()
  }, [refreshMyOrganization])

  const closeOrganization = useCallback(async (organizationId: string, reason: string) => {
    await api.post(`/organizations/${organizationId}/close`, { reason })
    setOrganization(null)
  }, [])

  const value = useMemo<OrganisationContextType>(
    () => ({
      organization,
      loading,
      refreshMyOrganization,
      requestOrganizationCreation,
      listOrganizationRequests,
      approveOrganizationRequest,
      rejectOrganizationRequest,
      addOrganizationMember,
      removeOrganizationMember,
      regenerateOrganizationApiKey,
      setOrganizationAiConfig,
      suspendOrganization,
      closeOrganization,
    }),
    [
      organization,
      loading,
      refreshMyOrganization,
      requestOrganizationCreation,
      listOrganizationRequests,
      approveOrganizationRequest,
      rejectOrganizationRequest,
      addOrganizationMember,
      removeOrganizationMember,
      regenerateOrganizationApiKey,
      setOrganizationAiConfig,
      suspendOrganization,
      closeOrganization,
    ],
  )

  return <OrganisationContext.Provider value={value}>{children}</OrganisationContext.Provider>
}

export const useOrganisation = (): OrganisationContextType => {
  const context = useContext(OrganisationContext)
  if (!context) throw new Error('useOrganisation must be used within an OrganisationProvider')
  return context
}
