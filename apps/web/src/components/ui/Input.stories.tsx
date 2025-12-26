import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './input'
import { Label } from './label'

const meta: Meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}
