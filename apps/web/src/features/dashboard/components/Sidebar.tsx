import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui'

const navItems = [{ label: 'Overview', href: '/dashboard' }]

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">ConcordPoint</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Button key={item.href} variant="ghost" className="w-full justify-start" asChild>
            <Link to={item.href}>{item.label}</Link>
          </Button>
        ))}
      </nav>
    </aside>
  )
}
