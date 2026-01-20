import { Link, useRouteContext } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Clock,
  FileText,
  MousePointerClick,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

import { NavBar } from '@/components/common/NavBar'
import { Button } from '@/components/ui'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LandingPage() {
  const { user } = useRouteContext({ from: '__root__' })
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar user={user} />
      <HeroSection />
      <PainPointsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary w-fit">
          <Sparkles className="h-4 w-4" />
          Built for busy realtors
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Less Paperwork.
          <span className="block text-primary">More Closings.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Stop drowning in forms, follow-ups, and admin tasks. Realtor App automates the busy work
          so you can focus on what you do best—building relationships and closing deals.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required · Set up in 2 minutes
        </p>
      </section>
    </main>
  )
}

function PainPointsSection() {
  return (
    <section className="border-t py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          Your Time Is Too Valuable for Busywork
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Every hour spent on paperwork is an hour you're not spending with clients. Every missed
            follow-up is a potential deal slipping away. Every manual task is pulling you away from
            what actually grows your business.
          </p>
          <p>
            Realtor App handles the administrative heavy lifting—client intake forms, document
            tracking, follow-up reminders, and status updates—so you can stay focused on the human
            side of real estate.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-8 text-center">
          <StatItem value="10+" label="Hours saved per week" />
          <StatItem value="100%" label="Paperwork automated" />
          <StatItem value="0" label="Missed follow-ups" />
        </div>
      </div>
    </section>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className="border-t bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-2xl font-semibold">
          Everything You Need to Work Smarter
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          Powerful tools designed specifically for how realtors actually work.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={Users}
            title="Client Management"
            description="Track every client's journey from first contact to closing. Never lose track of where a deal stands."
          />
          <FeatureCard
            icon={FileText}
            title="Smart Forms"
            description="Digital intake forms that clients can fill out on any device. Data flows directly into your dashboard."
          />
          <FeatureCard
            icon={Zap}
            title="Automated Follow-ups"
            description="Set it and forget it. Automatic reminders and check-ins keep deals moving without manual effort."
          />
          <FeatureCard
            icon={CheckCircle2}
            title="Deal Tracking"
            description="Visual pipeline shows every deal's status at a glance. Know exactly what needs attention today."
          />
          <FeatureCard
            icon={Clock}
            title="Activity Timeline"
            description="Complete history of every interaction with each client. Pick up any conversation right where you left off."
          />
          <FeatureCard
            icon={MousePointerClick}
            title="One-Click Actions"
            description="Send documents, request signatures, and update statuses with a single click. No more app switching."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function HowItWorksSection() {
  return (
    <section className="border-t py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-2xl font-semibold">Up and Running in Minutes</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          No complex setup. No training required. Just sign up and start saving time.
        </p>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
          <StepItem number={1} title="Create Account" description="Sign up with your email" />
          <StepItem number={2} title="Add Clients" description="Import or invite your clients" />
          <StepItem number={3} title="Let It Work" description="Automation handles the rest" />
        </div>
      </div>
    </section>
  )
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function CtaSection() {
  return (
    <section className="border-t bg-primary/5 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold">Ready to Get Your Time Back?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join realtors who've automated their busywork and reclaimed hours every week for what
          matters—their clients.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link to="/register">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Realtor App — Automate the busywork. Focus on clients.</p>
      </div>
    </footer>
  )
}
