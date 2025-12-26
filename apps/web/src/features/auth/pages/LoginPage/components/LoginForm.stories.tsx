import type { Meta, StoryObj } from '@storybook/react-vite'

import { LoginForm } from './LoginForm'

const meta: Meta = {
  title: 'Features/Auth/LoginPage/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}
