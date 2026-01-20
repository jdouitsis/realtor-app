import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DatePicker } from './DatePicker'

const meta: Meta<typeof DatePicker> = {
  title: 'Composed/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  args: {
    placeholder: 'Pick a date',
  },
}

export const WithValue: Story = {
  args: {
    value: new Date(),
    placeholder: 'Pick a date',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Pick a date',
    disabled: true,
  },
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Select your birthday',
  },
}

function InteractiveDatePicker() {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <div className="space-y-4">
      <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
      <p className="text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveDatePicker />,
}
