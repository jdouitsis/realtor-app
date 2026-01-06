import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
} from '@/components/ui'

import type { NewsletterFrequency } from '../../../types/newsletter.types'
import { useNewsletterPreferences } from '../hooks/useNewsletterPreferences'
import { TagSelector } from './TagSelector'

const FREQUENCY_OPTIONS: { value: NewsletterFrequency; label: string }[] = [
  { value: 'weekly', label: 'Once a week' },
  { value: 'biweekly', label: 'Every other week' },
  { value: 'monthly', label: 'Once a month' },
]

export function NewsletterConfigForm() {
  const { preferences, updatePreferences } = useNewsletterPreferences()

  const handleFrequencyChange = (value: string) => {
    updatePreferences({ frequency: value as NewsletterFrequency })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = preferences.tags.includes(tag)
      ? preferences.tags.filter((t) => t !== tag)
      : [...preferences.tags, tag]
    updatePreferences({ tags: newTags })
  }

  const handleActiveToggle = (active: boolean) => {
    updatePreferences({ active })
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <p className="mt-2 text-muted-foreground">
          Customize how often you receive updates and which events you want to hear about.
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Section */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {preferences.active
                  ? 'You will receive newsletter emails'
                  : 'Newsletter emails are paused'}
              </p>
              <Switch
                id="newsletter-active"
                checked={preferences.active}
                onCheckedChange={handleActiveToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Frequency Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequency</CardTitle>
            <CardDescription>Choose how often you want to receive updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={preferences.frequency}
              onValueChange={handleFrequencyChange}
              disabled={!preferences.active}
              className="space-y-3"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-3">
                  <RadioGroupItem value={option.value} id={`freq-${option.value}`} />
                  <Label
                    htmlFor={`freq-${option.value}`}
                    className={!preferences.active ? 'text-muted-foreground' : undefined}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>
              Select which types of events to include in your newsletter.
              {preferences.tags.length === 0
                ? ' All categories will be included when none are selected.'
                : ` ${preferences.tags.length} selected.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagSelector
              selectedTags={preferences.tags}
              onTagToggle={handleTagToggle}
              disabled={!preferences.active}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
