import { getRouteApi, Link, Outlet } from '@tanstack/react-router'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'

import { MobileNav } from '../components/MobileNav'
import { Sidebar } from '../components/Sidebar'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'

const routeApi = getRouteApi('/_authenticated')

export function AuthenticatedLayout() {
  const { auth } = routeApi.useRouteContext()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCollapsed, toggleCollapsed] = useSidebarCollapsed()

  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose

  const handleLogout = async () => {
    await auth.logout()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar - hidden on mobile, sticky */}
      <div className="relative hidden md:block">
        <Sidebar isCollapsed={isCollapsed} className="sticky top-0 z-40" />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapsed}
          className="absolute -right-3 top-4 z-50 h-6 w-6 rounded-md border bg-background shadow-md"
        >
          <ToggleIcon className="h-3 w-3" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header - shown only on mobile */}
        <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden">
          <div className="w-9" /> {/* Spacer for centering */}
          <Link to="/dashboard" className="text-xl font-bold">
            Realtor App
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader className="mb-6">
                <SheetTitle className="mr-auto">Realtor App</SheetTitle>
              </SheetHeader>
              <MobileNav onNavigate={closeMobileMenu} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Desktop header - shown only on desktop */}
        <header className="z-40 hidden h-14 shrink-0 items-center border-b bg-background px-6 md:flex">
          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
