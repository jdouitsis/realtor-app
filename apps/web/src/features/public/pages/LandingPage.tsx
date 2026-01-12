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
          Discover Christian Events
          <span className="block text-primary">In Your Community</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Realtor App connects you with Christian events hosted by churches and organizations in
          your area. From worship nights to community gatherings, find meaningful ways to grow in
          faith and fellowship.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/events">Browse Events</Link>
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
            Realtor App is a simple network where different church families can act as cousins —
            sharing events they want to open up, attending gatherings hosted by others, and getting
            to know one another better.
          </p>
          <p>
            Our cities are home to many Christian communities, each with their own congregations,
            traditions, and events. Yet despite sharing the same faith, these church families often
            remain disconnected — unaware of what their brothers and sisters across town are doing.
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
          Connecting Communities Through Faith
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Find Events"
            description="Browse worship services, Bible studies, youth groups, and community outreach events near you."
          />
          <FeatureCard
            title="Connect with Churches"
            description="Discover local churches and Christian organizations hosting events in your area."
          />
          <FeatureCard
            title="Grow Together"
            description="Build meaningful connections with others on their faith journey."
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
        <p>Realtor App — Bringing Christian communities together</p>
      </div>
    </footer>
  )
}
