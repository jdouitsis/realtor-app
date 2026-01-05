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
    location: 'Westminster Chapel',
    imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&h=400&fit=crop',
    tags: ['social'],
  },
  {
    id: '3',
    title: 'Community Potluck',
    date: '2026-01-18',
    time: '12:00 PM',
    description: 'Bring a dish to share and enjoy fellowship with the church family.',
    location: 'Riverside Park Pavilion, 456 River Rd',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop',
    tags: ['social'],
  },
  {
    id: '4',
    title: 'Youth Group Meetup',
    date: '2026-01-10',
    time: '6:30 PM',
    description: 'Fun and faith for teens in grades 6-12.',
    location: 'Grace Community Church, Youth Center',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=400&fit=crop',
    tags: ['youth'],
  },
  {
    id: '5',
    title: 'Volunteer Day',
    date: '2026-01-25',
    time: '9:00 AM',
    description: 'Serve our community through local outreach projects.',
    location: 'Meet at Hope Food Bank, 789 Oak Ave',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop',
    tags: ['outreach'],
  },
  {
    id: '6',
    title: 'Pregnancy Care Centre Volunteer Training',
    date: '2026-01-15',
    time: '6:00 PM',
    description:
      'Learn how to support expectant mothers and families in need through our volunteer program.',
    location: 'Pregnancy Care Centre, 200 Cedar St',
    imageUrl: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1200&h=400&fit=crop',
    tags: ['outreach', 'training'],
  },
  {
    id: '7',
    title: 'Gospel Coalition Young Adults Conference',
    date: '2026-01-24',
    time: '9:00 AM',
    description:
      'A day of teaching, worship, and fellowship for young adults seeking to grow in their faith.',
    location: 'Downtown Convention Centre, 500 Main St',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=400&fit=crop',
    tags: ['young-adults', 'conference'],
    contactEmail: 'events@tgc.org',
  },
  {
    id: '8',
    title: 'Apologetics Canada Leadership Summit',
    date: '2026-02-07',
    time: '8:30 AM',
    description:
      "Equipping church leaders to engage thoughtfully with questions of faith in today's culture.",
    location: 'Pacific Community Church, 1200 Oak Blvd',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=400&fit=crop',
    tags: ['conference', 'training'],
    contactEmail: 'info@apologeticscanada.com',
  },
  {
    id: '9',
    title: 'Pickleball Tournament',
    date: '2026-01-20',
    time: '10:00 AM',
    description:
      'Join us for a friendly pickleball tournament! All skill levels welcome. Bring your paddle or borrow one of ours.',
    location: 'Community Recreation Centre, 300 Sports Way',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=400&fit=crop',
    tags: ['sports', 'social'],
  },
  {
    id: '10',
    title: 'Tennis Social & Doubles Mixer',
    date: '2026-01-27',
    time: '2:00 PM',
    description:
      'Meet new tennis partners and enjoy an afternoon of doubles play followed by refreshments.',
    location: 'Greenview Tennis Club, 150 Court Lane',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&h=400&fit=crop',
    tags: ['sports', 'social'],
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

/**
 * Returns suggested events, excluding the specified event ID.
 *
 * @example
 * const suggested = useSuggestedEvents('1', 2)
 */
export function useSuggestedEvents(excludeId: string, limit: number = 2): Event[] {
  return EVENTS.filter((event) => event.id !== excludeId).slice(0, limit)
}
