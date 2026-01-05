import { Link, useRouteContext, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const context = useRouteContext({ from: '__root__' })
  const isAuthenticated = context.auth.isAuthenticated
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isEventsActive = pathname.startsWith('/events')

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background px-4 md:px-6">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            ConcordPoint
          </Link>
          <Link
            to="/events"
            className={cn(
              'hidden text-sm transition-colors hover:text-foreground md:block',
              isEventsActive ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            Events
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          {isAuthenticated && user ? <AuthenticatedNav user={user} /> : <UnauthenticatedNav />}
        </nav>

        {/* Mobile hamburger menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4">
              <Link
                to="/events"
                onClick={closeMobileMenu}
                className={cn(
                  'text-lg transition-colors hover:text-foreground',
                  isEventsActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                Events
              </Link>
              <div className="my-2 border-t" />
              {isAuthenticated && user ? (
                <MobileAuthenticatedNav user={user} onNavigate={closeMobileMenu} />
              ) : (
                <MobileUnauthenticatedNav onNavigate={closeMobileMenu} />
              )}
            </nav>
          </SheetContent>
        </Sheet>
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

function MobileAuthenticatedNav({ user, onNavigate }: { user: User; onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{getInitials(user.name || 'U')}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">
          Welcome{user.name ? `, ${user.name}` : ''}!
        </span>
      </div>
      <Link
        to="/profile"
        onClick={onNavigate}
        className="text-lg text-muted-foreground transition-colors hover:text-foreground"
      >
        Profile
      </Link>
    </div>
  )
}

function MobileUnauthenticatedNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Button variant="outline" asChild className="w-full">
        <Link to="/login" onClick={onNavigate}>
          Login
        </Link>
      </Button>
      <Button asChild className="w-full">
        <Link to="/register" onClick={onNavigate}>
          Get Started
        </Link>
      </Button>
    </div>
  )
}
