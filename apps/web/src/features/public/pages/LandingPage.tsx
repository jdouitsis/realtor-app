import { Link, useRouteContext } from '@tanstack/react-router'

import { NavBar } from '@/components/common/NavBar'
import { Button } from '@/components/ui'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LandingPage() {
  const { user } = useRouteContext({ from: '__root__' })
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar user={user} />
      <HeroSection />
      <WhyRealtorAppSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find Your Perfect Home
          <span className="block text-primary">With Ease</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Realtor App helps you discover properties that match your lifestyle. Browse listings,
          connect with agents, and find your dream home.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function WhyRealtorAppSection() {
  return (
    <section className="border-t py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 text-center text-2xl font-semibold">Why Realtor App</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Realtor App simplifies the home search process by bringing together the best listings
            and connecting you directly with experienced real estate professionals.
          </p>
          <p>
            Whether you're buying your first home or looking for an investment property, our
            platform provides the tools and insights you need to make informed decisions.
          </p>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="border-t bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-2xl font-semibold">
          Everything You Need to Find Home
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Search Properties"
            description="Browse thousands of listings with detailed filters to find exactly what you're looking for."
          />
          <FeatureCard
            title="Connect with Agents"
            description="Get in touch with experienced real estate professionals in your area."
          />
          <FeatureCard
            title="Track Favorites"
            description="Save properties you love and get notified about price changes and updates."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Realtor App — Find your dream home</p>
      </div>
    </footer>
  )
}
