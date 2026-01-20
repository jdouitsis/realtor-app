import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileX, Inbox, Search, Users } from 'lucide-react'

import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'Composed/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="rounded-lg border p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    icon: Users,
    title: 'No clients yet',
    description: 'Get started by adding your first client.',
  },
}

export const WithAction: Story = {
  args: {
    icon: Users,
    title: 'No clients yet',
    description: 'Get started by adding your first client.',
    action: {
      label: 'Add Client',
      onClick: () => alert('Add client clicked'),
    },
  },
}

export const SearchNoResults: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
  },
}

export const EmptyInbox: Story = {
  args: {
    icon: Inbox,
    title: 'Your inbox is empty',
    description: 'No messages to display.',
  },
}

export const FileNotFound: Story = {
  args: {
    icon: FileX,
    title: 'File not found',
    description: 'The file you are looking for does not exist or has been deleted.',
    action: {
      label: 'Go Back',
      onClick: () => alert('Go back clicked'),
    },
  },
}

export const WithoutIcon: Story = {
  args: {
    title: 'Nothing here',
    description: 'This section is empty.',
  },
}
