import { Link, useRouteContext } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Coffee,
  FileCheck,
  FileSearch,
  FileText,
  FolderOpen,
  Heart,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Target,
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
      <SolutionOverview />
      <FeaturesSection />
      <BeforeAfterSection />
      <CtaSection />
      <Footer />
    </div>
  )
}

function HeroSection() {
  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex w-fit items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Built for Canadian Realtors
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Collect Once.
            <span className="block text-primary">Use Everywhere.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stop re-entering the same client info across dozens of forms. Collect IDs, contact info,
            and documents once—then auto-fill every form for every deal.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register">
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Early access opening soon · No credit card required
          </p>
        </div>
      </section>
    </main>
  )
}

function PainPointsSection() {
  return (
    <section className="border-t py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Sound Familiar?</h2>
          <p className="text-muted-foreground">
            If you've been in real estate for more than a few months, you know these frustrations
            all too well.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PainPointCard
            icon={RefreshCw}
            title="The Same Info, Over and Over"
            description="You enter the same client details—name, phone, email, spouse info—into 15+ forms per deal. Copy-paste. Re-type. Repeat."
          />
          <PainPointCard
            icon={MessageSquare}
            title="Documents Everywhere"
            description="Pre-approvals in email. IDs in WhatsApp. Employment letters in text. You're hunting through three apps just to find one document."
          />
          <PainPointCard
            icon={FileSearch}
            title="What's Missing?"
            description="You know you need the signed disclosure, but did they send it? Is it the right version? You spend 20 minutes looking before asking again."
          />
          <PainPointCard
            icon={CalendarClock}
            title="Surprise Expirations"
            description="That pre-approval expired two weeks ago. Now you're scrambling to get a new one before the offer deadline."
          />
          <PainPointCard
            icon={Heart}
            title="Forgotten Personal Details"
            description={`"What was their daughter's name again?" The details that build relationships disappear from your memory between deals.`}
          />
          <PainPointCard
            icon={AlertTriangle}
            title="Deals Stall Silently"
            description="You don't realize a document is missing until the lawyer asks for it. Then you're chasing clients at the worst possible moment."
          />
        </div>
      </div>
    </section>
  )
}

function PainPointCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function SolutionOverview() {
  return (
    <section className="border-t bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">One Profile. Every Deal.</h2>
          <p className="text-muted-foreground">
            Everything you know about a client—stored once, used everywhere. We call them{' '}
            <strong>artifacts</strong>.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              number={1}
              icon={FolderOpen}
              title="Collect"
              description="IDs, pre-approvals, contact info, preferences—all stored as artifacts in one client profile."
            />
            <StepCard
              number={2}
              icon={Zap}
              title="Auto-Fill"
              description="Start a new deal and forms auto-populate from the client profile. No re-entry."
            />
            <StepCard
              number={3}
              icon={Target}
              title="Track"
              description="See what's collected, what's missing, and what's expiring. One dashboard, complete visibility."
            />
          </div>
          <div className="mt-12 rounded-xl border border-border/50 bg-card p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <ArtifactTypeList
                title="Deal Artifacts"
                subtitle="Required for transactions"
                items={[
                  { icon: FileText, label: 'Government IDs' },
                  { icon: FileCheck, label: 'Pre-approval letters' },
                  { icon: FileText, label: 'Employment verification' },
                  { icon: FileText, label: 'Financial documents' },
                ]}
              />
              <ArtifactTypeList
                title="Personal Artifacts"
                subtitle="Build lasting relationships"
                items={[
                  { icon: Coffee, label: 'Coffee order' },
                  { icon: Users, label: 'Family members' },
                  { icon: Heart, label: 'Preferences & notes' },
                  { icon: Bell, label: 'Communication style' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="relative rounded-lg border border-border/50 bg-card p-6 text-center">
      <div className="absolute -top-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {number}
      </div>
      <div className="mb-3 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function ArtifactTypeList({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle: string
  items: { icon: LucideIcon; label: string }[]
}) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className="border-t py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Built for How You Work</h2>
          <p className="text-muted-foreground">
            Not another CRM. A purpose-built system for collecting, organizing, and using client
            information.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={FileCheck}
            title="Smart Collection"
            description="Send clients a link to upload documents and fill in details. Everything lands in the right place automatically."
          />
          <FeatureCard
            icon={Clock}
            title="Expiration Tracking"
            description="Pre-approvals, IDs, and other time-sensitive documents tracked automatically. Get alerts before they expire."
          />
          <FeatureCard
            icon={Send}
            title="One-Click Requests"
            description="Missing a document? Request it with one click. Clients get a simple link to upload directly to their profile."
          />
          <FeatureCard
            icon={CheckCircle2}
            title="Validation Flows"
            description="Before an offer, send clients a confirmation request. They review and approve their info—no surprises at closing."
          />
          <FeatureCard
            icon={Users}
            title="Team Sharing"
            description={`Assistants and team members see exactly what's needed. No more "did you get the ID?" messages.`}
          />
          <FeatureCard
            icon={Heart}
            title="Relationship Memory"
            description="Personal notes, preferences, and details stay with the client forever. Remember what matters, even years later."
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

function BeforeAfterSection() {
  return (
    <section className="border-t bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">The Difference</h2>
          <p className="text-muted-foreground">
            See how your workflow changes when client info is collected once and reused everywhere.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <ScenarioCard
              variant="before"
              title="Without This"
              items={[
                'Request docs via email, text, WhatsApp',
                'Hunt through threads to find what they sent',
                'Re-enter the same info into 15+ forms per deal',
                'Chase down missing items multiple times',
                'Manually track what you have vs. what you need',
              ]}
            />
            <ScenarioCard
              variant="after"
              title="With This"
              items={[
                'Client uploads everything to one place',
                'All docs organized and searchable instantly',
                'Forms auto-fill from the client profile',
                'Dashboard shows what is missing at a glance',
                'One click to request anything outstanding',
              ]}
            />
          </div>
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-lg font-medium">
              Repeat clients? Even faster.
              <span className="block text-primary">Their info is already there.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ScenarioCard({
  variant,
  title,
  items,
}: {
  variant: 'before' | 'after'
  title: string
  items: string[]
}) {
  const isBefore = variant === 'before'
  return (
    <div
      className={`rounded-lg border p-6 ${
        isBefore ? 'border-border/50 bg-card' : 'border-primary/30 bg-primary/5'
      }`}
    >
      <h3 className={`mb-4 font-semibold ${isBefore ? 'text-muted-foreground' : 'text-primary'}`}>
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm">
            {isBefore ? (
              <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            ) : (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                strokeWidth={1.5}
              />
            )}
            <span className={isBefore ? 'text-muted-foreground' : ''}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CtaSection() {
  return (
    <section className="border-t bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Ready to Stop Re-Entering Data?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join the waitlist for early access. Be among the first Canadian realtors to experience
            effortless client management.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/register">
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. We'll only email when there's something worth sharing.
          </p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Collect once. Use everywhere. Close faster.</p>
      </div>
    </footer>
  )
}
