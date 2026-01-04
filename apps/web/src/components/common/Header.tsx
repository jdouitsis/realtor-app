import { getRouteApi } from '@tanstack/react-router'

import { Button } from '@/components/ui'

const routeApi = getRouteApi('/_authenticated')

export function Header() {
  const { auth } = routeApi.useRouteContext()
  const { user } = routeApi.useRouteContext()

  const handleLogout = async () => {
    await auth.logout()
  }

  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
