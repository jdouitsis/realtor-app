import type { Meta, StoryObj } from '@storybook/react-vite'
import { RegisterForm } from './RegisterForm'

const meta: Meta<typeof RegisterForm> = {
  title: 'Features/Auth/RegisterForm',
  component: RegisterForm,
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
type Story = StoryObj<typeof RegisterForm>

export const Default: Story = {}
