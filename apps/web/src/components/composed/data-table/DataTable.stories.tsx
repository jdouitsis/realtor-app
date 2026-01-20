import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, SortableHeader } from './DataTable'

const meta: Meta<typeof DataTable> = {
  title: 'Composed/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
}

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'pending' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', status: 'active' },
]

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          }`}
        >
          {status}
        </span>
      )
    },
  },
]

export const Default: Story = {
  args: {
    columns,
    data: users,
  },
}

export const WithSearch: Story = {
  args: {
    columns,
    data: users,
    searchKey: 'email',
    searchPlaceholder: 'Filter by email...',
  },
}

export const WithColumnToggle: Story = {
  args: {
    columns,
    data: users,
    showColumnToggle: true,
  },
}

export const WithoutPagination: Story = {
  args: {
    columns,
    data: users,
    showPagination: false,
  },
}

export const FullFeatured: Story = {
  args: {
    columns,
    data: users,
    searchKey: 'email',
    searchPlaceholder: 'Filter by email...',
    showColumnToggle: true,
    showPagination: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
}
