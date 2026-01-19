import { Link } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user: {
    name: string
    email: string
  }
  onLogout: () => void
  /** Use "light" variant for dark/colored backgrounds */
  variant?: 'default' | 'light'
}

/**
 * Extracts initials from a user's name.
 *
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('Alice') // 'A'
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function UserAvatar({ user, onLogout, variant = 'default' }: UserAvatarProps) {
  const initials = getInitials(user.name)
  const isLight = variant === 'light'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('relative h-9 w-9 rounded-full', isLight && 'hover:bg-white/10')}
        >
          <Avatar className={cn('h-9 w-9', isLight && 'ring-2 ring-white/30')}>
            <AvatarFallback className={cn(isLight && 'bg-white/20 text-white')}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex w-full cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
