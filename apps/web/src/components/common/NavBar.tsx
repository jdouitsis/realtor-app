import { Link, useRouteContext } from '@tanstack/react-router'

import { Avatar, AvatarFallback, Button } from '@/components/ui'

interface User {
  name: string | null
}

interface HeaderProps {
  user?: User
}

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

export function NavBar({ user }: HeaderProps) {
  const context = useRouteContext({ from: '__root__' })
  const isAuthenticated = context.auth.isAuthenticated

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          ConcordPoint
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? <AuthenticatedNav user={user} /> : <UnauthenticatedNav />}
        </nav>
      </div>
    </header>
  )
}

function AuthenticatedNav({ user }: { user: User }) {
  return (
    <>
      <span className="hidden text-sm text-muted-foreground md:inline">
        Welcome{user.name ? `, ${user.name}` : ''}!
      </span>
      <Link
        to="/profile"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback>{getInitials(user.name || 'U')}</AvatarFallback>
        </Avatar>
      </Link>
    </>
  )
}

function UnauthenticatedNav() {
  return (
    <>
      <Button variant="ghost" asChild>
        <Link to="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link to="/register">Get Started</Link>
      </Button>
    </>
  )
}
