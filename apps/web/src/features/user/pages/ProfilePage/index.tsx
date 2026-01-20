import { Link, Outlet, useLocation } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Settings, Shield, User } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { FileRouteTypes } from '@/routeTree.gen'

interface Tab {
  label: string
  path: FileRouteTypes['to']
  icon: LucideIcon
}

const TABS: Tab[] = [
  { label: 'General', path: '/profile/general', icon: User },
  { label: 'Sessions', path: '/profile/sessions', icon: Shield },
  { label: 'Danger', path: '/profile/danger', icon: AlertTriangle },
]

export function ProfilePageLayout() {
  const location = useLocation()
  const currentPath = location.pathname

  const hydratedTabs = TABS.map((tab) => ({
    ...tab,
    isActive: currentPath === tab.path || currentPath.startsWith(`${tab.path}/`),
    Icon: tab.icon,
  }))

  return (
    <div className="space-y-6">
      <PageHeader />

      {/* Tabs Navigation */}
      <div className="border-b border-border -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {hydratedTabs.map(({ path, label, isActive, Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'relative flex items-center gap-2 px-3 md:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'text-blue-600 hover:text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              {label}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  )
}

function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <span className="p-2 rounded-lg bg-muted text-foreground">
        <Settings className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
    </div>
  )
}
