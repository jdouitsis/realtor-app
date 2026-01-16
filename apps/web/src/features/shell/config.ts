import { LayoutDashboard, Users } from 'lucide-react'
import type { ComponentType } from 'react'

import type { FileRouteTypes } from '@/routeTree.gen'

export const sideBarTransition = 'width 0.15s linear'

export interface MenuItem {
  label: string
  icon: ComponentType<{ className?: string }>
  to: FileRouteTypes['to']
  realtorOnly?: boolean
}

export const MenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Clients', icon: Users, to: '/clients', realtorOnly: true },
]
