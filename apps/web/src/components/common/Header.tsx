import { getRouteApi, Link } from '@tanstack/react-router'
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

const routeApi = getRouteApi('/_authenticated')

const navItems = [{ label: 'Overview', href: '/dashboard' }]

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            ConcordPoint
          </Link>
          <DesktopNav />
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground md:inline">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </span>
          <Link
            to="/profile"
            className="hidden rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:block"
          >
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback>{getInitials(user.name || 'U')}</AvatarFallback>
            </Avatar>
          </Link>
          <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} userName={user.name} />
        </div>
      </div>
    </header>
  )
}

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item) => (
        <Button key={item.href} variant="ghost" size="sm" asChild>
          <Link to={item.href}>{item.label}</Link>
        </Button>
      ))}
    </nav>
  )
}

function MobileMenu({
  open,
  onOpenChange,
  userName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string | null
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-6">
          <Link
            to="/profile"
            className="flex items-center gap-3"
            onClick={() => onOpenChange(false)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(userName || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{userName || 'User'}</span>
              <span className="text-sm text-muted-foreground">View profile</span>
            </div>
          </Link>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="justify-start"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link to={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
