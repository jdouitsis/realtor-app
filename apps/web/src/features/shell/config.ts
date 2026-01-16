import { LayoutDashboard, Users } from 'lucide-react'
import type { ComponentType } from 'react'

export const sideBarTransition = 'width 0.15s linear'

export interface MenuItem {
  label: string
  icon: ComponentType<{ className?: string }>
  to: string
  realtorOnly?: boolean
}

export const MenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Clients', icon: Users, to: '/clients', realtorOnly: true },
]
