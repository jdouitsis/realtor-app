import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/landing" className="text-xl font-bold">
          Finance App
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
