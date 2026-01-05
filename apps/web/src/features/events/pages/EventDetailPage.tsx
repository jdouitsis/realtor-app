import { getRouteApi, Link, useRouteContext } from '@tanstack/react-router'
import { Calendar, Check, ChevronLeft, Clock, MapPin, Share2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui'

import { useEvent, useSuggestedEvents } from '../hooks/useEvents'

const routeApi = getRouteApi('/_public/events/$eventId')

export function EventDetailPage() {
  const { eventId } = routeApi.useParams()
  const { user } = useRouteContext({ from: '__root__' })
  const event = useEvent(eventId)
  const suggestedEvents = useSuggestedEvents(eventId, 2)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    // Use native share sheet if available (iOS, Android, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          url,
        })
        return
      } catch {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fallback to clipboard copy
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="mb-4 text-2xl font-bold">Event Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          This event may have been removed or the link is incorrect.
        </p>
        <Button asChild variant="outline">
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-start pb-8">
      <Link
        to="/events"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-lg">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-48 w-full object-cover sm:h-64"
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <Button
            variant={copied ? 'default' : 'outline'}
            size="sm"
            onClick={handleShare}
            className={copied ? 'bg-green-600 hover:bg-green-600' : ''}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-5 w-5 shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5 shrink-0" />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="border-t pt-6">
          {user ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/login" search={{ redirect: `/events/${eventId}` }}>
                Show Location
              </Link>
            </Button>
          )}
        </div>

        <div className="border-t pt-6">
          <h2 className="mb-2 text-lg font-semibold">About this event</h2>
          <p className="text-muted-foreground">{event.description}</p>
        </div>

        {suggestedEvents.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold">You may like these events as well</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {suggestedEvents.map((suggestedEvent) => (
                <Link
                  key={suggestedEvent.id}
                  to="/events/$eventId"
                  params={{ eventId: suggestedEvent.id }}
                  className="group overflow-hidden rounded-lg border transition-colors hover:bg-muted/50"
                >
                  <img
                    src={suggestedEvent.imageUrl}
                    alt={suggestedEvent.title}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="font-medium group-hover:underline">{suggestedEvent.title}</p>
                    <p className="text-sm text-muted-foreground">{suggestedEvent.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
