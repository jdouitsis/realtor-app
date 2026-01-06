export type NewsletterFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface NewsletterPreferences {
  frequency: NewsletterFrequency
  tags: string[]
  active: boolean
}

export const DEFAULT_NEWSLETTER_PREFERENCES: NewsletterPreferences = {
  frequency: 'weekly',
  tags: [],
  active: true,
}
