import { Link, useRouterState } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui'
import { cn } from '@/lib/utils'

import { MenuItems } from '../config'

interface MobileNavProps {
  user: {
    name: string
    email: string
    isRealtor: boolean
  }
  onNavigate: () => void
  onLogout: () => void
}

/**
 * Extracts initials from a user's name.
 *
 * @example
 * getInitials('John Doe') // 'JD'
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function MobileNav({ user, onNavigate, onLogout }: MobileNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const initials = getInitials(user.name)
  const isProfileActive = pathname === '/profile'
  const visibleMenuItems = MenuItems.filter((item) => !item.realtorOnly || user.isRealtor)

  return (
    <nav className="flex flex-col gap-2">
      {/* User info section */}
      <Link
        to="/profile"
        onClick={onNavigate}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
          isProfileActive ? 'bg-accent font-medium text-accent-foreground' : ''
        )}
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </Link>

      <div className="my-2 border-t" />

      {visibleMenuItems.map((item) => {
        const isActive = pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}

      <div className="my-2 border-t" />

      <button
        type="button"
        onClick={() => {
          onNavigate()
          onLogout()
        }}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </nav>
  )
}
