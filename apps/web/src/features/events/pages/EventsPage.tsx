import { Link } from '@tanstack/react-router'

import { useEvents } from '../hooks/useEvents'

export function EventsPage() {
  const events = useEvents()

  return (
    <div className="flex flex-col justify-start">
      <h1 className="mb-6 text-3xl font-bold">Upcoming Events</h1>
      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <Link
            key={event.id}
            to="/events/$eventId"
            params={{ eventId: event.id }}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {event.date} at {event.time}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
