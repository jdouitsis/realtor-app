export interface Event {
  id: string
  title: string
  date: string
  time: string
  description: string
  location?: string
  imageUrl: string
  tags: string[]
  /** If set, show "contact X for location" instead of the actual location. */
  contactEmail?: string
}

/** Available event tags for filtering. */
export const EVENT_TAGS = [
  { value: 'youth', label: 'Youth' },
  { value: 'young-adults', label: 'Young Adults' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'conference', label: 'Conference' },
  { value: 'training', label: 'Training' },
] as const

const EVENTS: Event[] = [
  {
    id: '2',
    title: 'Line Dancing Night',
    date: '2026-01-08',
    time: '7:00 PM',
    description: 'Learn some moves and have fun with friends at our monthly line dancing event.',
    location: 'Concord Point Community Church',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&h=400&fit=crop',
    tags: ['social'],
  },
  {
    id: '3',
    title: 'Community Potluck',
    date: '2026-01-18',
    time: '12:00 PM',
    description: 'Bring a dish to share and enjoy fellowship with the church family.',
    location: 'Church',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
    tags: ['social'],
  },
  {
    id: '4',
    title: 'Youth Group Meetup',
    date: '2026-01-10',
    time: '6:30 PM',
    description: 'Fun and faith for teens in grades 6-12.',
    location: 'Church, Youth Center',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop',
    tags: ['youth'],
  },
  {
    id: '5',
    title: 'Volunteer Day',
    date: '2026-01-25',
    time: '9:00 AM',
    description: 'Serve our community through local outreach projects.',
    location: 'Food Bank',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop',
    tags: ['outreach'],
  },
  {
    id: '7',
    title: 'Young Adults Conference',
    date: '2026-01-24',
    time: '9:00 AM',
    description:
      'A day of teaching, worship, and fellowship for young adults seeking to grow in their faith.',
    location: 'Downtown Convention Centre',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=400&fit=crop',
    tags: ['young-adults', 'conference'],
    contactEmail: 'events@conference.org',
  },
  {
    id: '8',
    title: 'Mens Leadership Summit',
    date: '2026-02-07',
    time: '8:30 AM',
    description:
      "Equipping church leaders to engage thoughtfully with questions of faith in today's culture.",
    location: 'Pacific West Community Church',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=400&fit=crop',
    tags: ['conference', 'training'],
    contactEmail: 'info@mensleadershipsummit.com',
  },
  {
    id: '9',
    title: 'Pickleball Tournament',
    date: '2026-01-20',
    time: '10:00 AM',
    description:
      'Join us for a friendly pickleball tournament with your Christian brothers and sisters! All skill levels welcome. Bring your paddle or borrow one of ours.',
    location: 'Community Recreation Centre',
    imageUrl: 'https://images.unsplash.com/photo-1659318006095-4d44845f3a1b?w=1200&h=400&fit=crop',
    tags: ['sports', 'social'],
  },
  {
    id: '10',
    title: 'Tennis Social & Doubles Mixer',
    date: '2026-01-27',
    time: '2:00 PM',
    description:
      'Meet new tennis partners and enjoy an afternoon of doubles play followed by refreshments and a time of fellowship.',
    location: 'Greenview Tennis Club, 150 Court Lane',
    imageUrl:
      'https://images.unsplash.com/flagged/photo-1576972405668-2d020a01cbfa?w=1200&h=400&fit=crop',
    tags: ['sports', 'social'],
  },
]

/**
 * Returns all events.
 *
 * @example
 * const events = getEvents()
 */
export function getEvents(): Event[] {
  return EVENTS
}

/**
 * Returns a single event by ID, or undefined if not found.
 *
 * @example
 * const event = getEvent('1')
 */
export function getEvent(id: string): Event | undefined {
  return EVENTS.find((event) => event.id === id)
}

/**
 * Returns suggested events, excluding the specified event ID.
 *
 * @example
 * const suggested = getSuggestedEvents('1', 2)
 */
export function getSuggestedEvents(excludeId: string, limit: number = 2): Event[] {
  return EVENTS.filter((event) => event.id !== excludeId).slice(0, limit)
}
