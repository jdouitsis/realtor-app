import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui'

export function LandingPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Take Control of Your Finances
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Track expenses, monitor investments, and achieve your financial goals with our simple and
          powerful finance management tools.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Start Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
