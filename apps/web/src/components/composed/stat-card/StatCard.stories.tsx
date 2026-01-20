import type { Meta, StoryObj } from '@storybook/react-vite'
import { DollarSign, TrendingUp, Users } from 'lucide-react'

import { StatCard } from './StatCard'

const meta: Meta<typeof StatCard> = {
  title: 'Composed/StatCard',
  component: StatCard,
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
type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    title: 'Total Clients',
    value: 42,
    icon: Users,
  },
}

export const WithPositiveTrend: Story = {
  args: {
    title: 'Total Clients',
    value: 42,
    icon: Users,
    trend: {
      value: 12.5,
      label: 'from last month',
    },
  },
}

export const WithNegativeTrend: Story = {
  args: {
    title: 'Revenue',
    value: '$12,400',
    icon: DollarSign,
    trend: {
      value: -8.2,
      label: 'from last month',
    },
  },
}

export const WithNeutralTrend: Story = {
  args: {
    title: 'Growth Rate',
    value: '0%',
    icon: TrendingUp,
    trend: {
      value: 0,
      label: 'no change',
    },
  },
}

export const WithoutIcon: Story = {
  args: {
    title: 'Active Deals',
    value: 8,
    trend: {
      value: 25,
    },
  },
}

export const Grid: Story = {
  decorators: [
    () => (
      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
        <StatCard
          title="Total Clients"
          value={42}
          icon={Users}
          trend={{ value: 12.5, label: 'from last month' }}
        />
        <StatCard
          title="Revenue"
          value="$12,400"
          icon={DollarSign}
          trend={{ value: -8.2, label: 'from last month' }}
        />
      </div>
    ),
  ],
}
