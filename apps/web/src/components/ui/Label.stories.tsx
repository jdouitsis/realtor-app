import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './input'
import { Label } from './label'

const meta: Meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    children: 'Label text',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">Your name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
}
