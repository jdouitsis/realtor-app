import { Link, useRouteContext } from '@tanstack/react-router'
import { Mail } from 'lucide-react'

import { useStorage } from '@/lib/storage'

import { useEvents } from '../../hooks/useEvents'
import { useEventTagFilter } from '../../hooks/useEventTagFilter'
import { EventTagFilter } from './components/EventTagFilter'

export function EventsPage() {
  const allEvents = useEvents()
  const { filterByTags } = useEventTagFilter()
  const context = useRouteContext({ from: '__root__' })
  const [newsletterPrefs] = useStorage('newsletter_preferences')

  const filteredEvents = allEvents.filter(filterByTags)
  const showNewsletterPromo = !context.auth.isAuthenticated || !newsletterPrefs?.active

  return (
    <div className="flex flex-col justify-start">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <EventTagFilter />
      </div>

      {showNewsletterPromo && (
        <Link
          to="/newsletter"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Mail className="h-4 w-4" />
          <span>Stay up to date with our newsletter</span>
        </Link>
      )}

      <div className="flex flex-col gap-3">
        {filteredEvents.map((event) => (
          <Link
            key={event.id}
            to="/events/$eventId"
            params={{ eventId: event.id }}
            className="flex overflow-hidden rounded-lg border transition-colors hover:bg-muted/50"
          >
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-28 shrink-0 object-cover sm:w-36"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 sm:p-4">
              <p className="font-medium">{event.title}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
              <p className="text-sm text-muted-foreground">
                {event.date} at {event.time}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="my-12 border-t pt-8 text-center">
        <p className="text-muted-foreground">
          Know of an event that should be listed here? We'd love to hear from you.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Concord is all about connecting church families across our city.
        </p>
      </div>
    </div>
  )
}
