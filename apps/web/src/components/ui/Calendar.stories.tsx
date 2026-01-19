import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Calendar } from './calendar'

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  args: {},
}

function SingleSelectCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div>
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  )
}

export const SingleSelection: Story = {
  render: () => <SingleSelectCalendar />,
}

function RangeCalendar() {
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  return (
    <div>
      <Calendar
        mode="range"
        selected={range}
        onSelect={(newRange) => setRange(newRange || { from: undefined, to: undefined })}
        className="rounded-md border"
        numberOfMonths={2}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        From: {range.from?.toLocaleDateString() || 'None'} | To:{' '}
        {range.to?.toLocaleDateString() || 'None'}
      </p>
    </div>
  )
}

export const RangeSelection: Story = {
  render: () => <RangeCalendar />,
}

export const WithDisabledDates: Story = {
  render: () => (
    <Calendar
      mode="single"
      disabled={(date) => date < new Date()}
      className="rounded-md border"
    />
  ),
}

export const TwoMonths: Story = {
  render: () => (
    <Calendar mode="single" numberOfMonths={2} className="rounded-md border" />
  ),
}
