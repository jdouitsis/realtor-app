import { getRouteApi, Link, useRouteContext } from '@tanstack/react-router'
import { Calendar, ChevronLeft, Clock, MapPin } from 'lucide-react'

import { Button } from '@/components/ui'

import { useEvent } from '../hooks/useEvents'

const routeApi = getRouteApi('/_public/events/$eventId')

export function EventDetailPage() {
  const { eventId } = routeApi.useParams()
  const { user } = useRouteContext({ from: '__root__' })
  const event = useEvent(eventId)

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
    <div className="flex flex-col justify-start">
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

        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
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
      </div>
    </div>
  )
}
