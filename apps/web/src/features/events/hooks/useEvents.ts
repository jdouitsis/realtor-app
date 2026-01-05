export interface Event {
  id: string
  title: string
  date: string
  time: string
  description: string
  location: string
}

const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sunday Morning Worship',
    date: '2026-01-12',
    time: '10:00 AM',
    description: 'Join us for our weekly worship service with music, prayer, and teaching.',
    location: 'Grace Community Church, 123 Main St',
  },
  {
    id: '2',
    title: 'Wednesday Prayer Meeting',
    date: '2026-01-08',
    time: '7:00 PM',
    description: 'Midweek gathering for prayer and fellowship.',
    location: 'Grace Community Church, Fellowship Hall',
  },
  {
    id: '3',
    title: 'Community Potluck',
    date: '2026-01-18',
    time: '12:00 PM',
    description: 'Bring a dish to share and enjoy fellowship with the church family.',
    location: 'Riverside Park Pavilion, 456 River Rd',
  },
  {
    id: '4',
    title: 'Youth Group Meetup',
    date: '2026-01-10',
    time: '6:30 PM',
    description: 'Fun and faith for teens in grades 6-12.',
    location: 'Grace Community Church, Youth Center',
  },
  {
    id: '5',
    title: 'Volunteer Day',
    date: '2026-01-25',
    time: '9:00 AM',
    description: 'Serve our community through local outreach projects.',
    location: 'Meet at Hope Food Bank, 789 Oak Ave',
  },
]

/**
 * Returns all events.
 *
 * @example
 * const events = useEvents()
 */
export function useEvents(): Event[] {
  return EVENTS
}

/**
 * Returns a single event by ID, or undefined if not found.
 *
 * @example
 * const event = useEvent('1')
 */
export function useEvent(id: string): Event | undefined {
  return EVENTS.find((event) => event.id === id)
}
