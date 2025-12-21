import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome back!</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Logout</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
