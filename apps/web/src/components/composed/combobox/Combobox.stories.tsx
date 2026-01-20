import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Combobox } from './Combobox'

const meta: Meta<typeof Combobox> = {
  title: 'Composed/Combobox',
  component: Combobox,
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
type Story = StoryObj<typeof Combobox>

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]

const frameworkOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
]

export const Default: Story = {
  args: {
    options: statusOptions,
    placeholder: 'Select status...',
  },
}

export const WithValue: Story = {
  args: {
    options: statusOptions,
    value: 'active',
    placeholder: 'Select status...',
  },
}

export const Disabled: Story = {
  args: {
    options: statusOptions,
    placeholder: 'Select status...',
    disabled: true,
  },
}

export const ManyOptions: Story = {
  args: {
    options: frameworkOptions,
    placeholder: 'Select framework...',
    searchPlaceholder: 'Search frameworks...',
  },
}

function InteractiveCombobox() {
  const [value, setValue] = useState('')
  return (
    <div className="space-y-4">
      <Combobox
        options={frameworkOptions}
        value={value}
        onChange={setValue}
        placeholder="Select framework..."
        searchPlaceholder="Search frameworks..."
      />
      <p className="text-sm text-muted-foreground">Selected: {value || 'None'}</p>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveCombobox />,
}
