import { getRouteApi, Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback } from '@/components/ui'

const routeApi = getRouteApi('/_authenticated')

/**
 * Extracts initials from a name string.
 *
 * @example
 * getInitials('John Doe') // 'JD'
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Header() {
  const { user } = routeApi.useRouteContext()

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback>{getInitials(user.name || 'U')}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}
