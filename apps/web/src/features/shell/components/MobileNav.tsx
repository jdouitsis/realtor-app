import { Link, useRouterState } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'

import { MenuItems } from '../config'

interface MobileNavProps {
  onNavigate: () => void
  onLogout: () => void
}

export function MobileNav({ onNavigate, onLogout }: MobileNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="flex flex-col gap-2">
      {MenuItems.map((item) => {
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
