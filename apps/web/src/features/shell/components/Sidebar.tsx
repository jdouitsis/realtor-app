import { Link, useRouterState } from '@tanstack/react-router'
import type { ComponentType } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'

import { MenuItems, sideBarTransition } from '../config'

interface SidebarProps {
  isCollapsed: boolean
  isRealtor: boolean
  className?: string
}

/**
 * Collapsible sidebar for authenticated layout.
 * Hidden on mobile, visible on md+ screens.
 */
export function Sidebar({ isCollapsed, isRealtor, className }: SidebarProps) {
  const visibleMenuItems = MenuItems.filter((item) => !item.realtorOnly || isRealtor)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{
          width: isCollapsed ? 64 : 200,
          transition: sideBarTransition,
        }}
        className={cn('flex h-screen min-w-0 flex-col border-r border-border bg-card', className)}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <Link
            to="/dashboard"
            className="flex items-center px-3 text-xl font-bold tracking-tighter"
          >
            <span
              style={{
                width: isCollapsed ? 13 : 70,
                transition: sideBarTransition,
              }}
              className="overflow-hidden"
            >
              Realtor
            </span>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {visibleMenuItems.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  )
}

interface SidebarNavItemProps {
  to: string
  icon: ComponentType<{ className?: string }>
  label: string
  isCollapsed: boolean
}

function SidebarNavItem({ to, icon: Icon, label, isCollapsed }: SidebarNavItemProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = pathname.startsWith(to)

  const className = cn(
    'flex h-10 w-full items-center rounded-md px-3 text-sm transition-colors duration-150',
    isActive
      ? 'bg-primary/10 font-medium text-primary'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={to} className={className}>
          <Icon className="h-5 w-5 shrink-0" />
          <span
            style={{
              width: isCollapsed ? 0 : 200,
              transition: sideBarTransition,
            }}
            className="overflow-hidden"
          >
            <span className="pl-3">{label}</span>
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent className={cn(isCollapsed ? '' : 'hidden')} side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
