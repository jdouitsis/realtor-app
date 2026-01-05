import { Link } from '@tanstack/react-router'

import { useEvents } from '../hooks/useEvents'

export function EventsPage() {
  const events = useEvents()

  return (
    <div className="flex flex-col justify-start">
      <h1 className="mb-6 text-3xl font-bold">Upcoming Events</h1>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
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
    </div>
  )
}
