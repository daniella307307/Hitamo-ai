import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Role = 'CANDIDATE' | 'RECRUITER' | 'ORG_OWNER' | 'ADMIN'

export interface SidebarItem {
  label: string
  path: string
}

const NAV_BY_ROLE: Record<Role, SidebarItem[]> = {
  CANDIDATE: [
    { label: 'Home', path: '/home' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Applications', path: '/applications' },
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: '/logout' },
  ],
  RECRUITER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Applications', path: '/applications' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Hitamo AI', path: '/hitamo-ai' },
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: '/logout' },
  ],
  ORG_OWNER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Applications', path: '/applications' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Hitamo AI', path: '/hitamo-ai' },
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: '/logout' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Console', path: '/admin' },
    { label: 'Applications', path: '/applications' },
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: '/logout' },
  ],
}

function normalizeRole(role?: string | null): Role {
  if (role === 'ADMIN') return 'ADMIN'
  if (role === 'ORG_OWNER') return 'ORG_OWNER'
  if (role === 'RECRUITER') return 'RECRUITER'
  return 'CANDIDATE'
}

interface SidebarProps {
  title?: string
  width?: number
}

export default function Sidebar({ title = 'Hitamo AI', width = 220 }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()

  const navItems = useMemo(() => {
    return NAV_BY_ROLE[normalizeRole(role)]
  }, [role])

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: '#1a7a6e',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        color: '#fff',
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          padding: '0 24px 24px',
          marginBottom: 32,
          borderBottom: '1px solid rgba(255,255,255,0.18)',
          letterSpacing: '-0.3px',
        }}
      >
        H- <span style={{ fontWeight: 400, opacity: 0.7 }}>{title}</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#156b5e' : 'rgba(255,255,255,0.82)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                border: 'none',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
