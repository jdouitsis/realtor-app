# Composed Components

Complex components built by composing shadcn/ui primitives. These components handle common UI patterns with a consistent Linear-style aesthetic.

## Components

| Component    | Description                                    | Dependencies                       |
| ------------ | ---------------------------------------------- | ---------------------------------- |
| `DataTable`  | TanStack Table wrapper with sorting, filtering | `@tanstack/react-table`            |
| `StatCard`   | Metric display with trend indicator            | Card, lucide-react                 |
| `EmptyState` | Illustrated placeholder for empty data         | Button, lucide-react               |
| `DatePicker` | Calendar + Popover composition                 | Calendar, Popover, Button          |
| `Combobox`   | Searchable select (Command + Popover)          | Command, Popover, Button           |
| `FileUpload` | Drag/drop file upload with preview             | `react-dropzone`, Button, Progress |

## Usage

Import from the composed directory:

```tsx
import {
  DataTable,
  StatCard,
  EmptyState,
  DatePicker,
  Combobox,
  FileUpload,
} from '@/components/composed'
```

## Patterns

### DataTable

```tsx
import { DataTable, SortableHeader } from '@/components/composed'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
  },
]

<DataTable
  columns={columns}
  data={users}
  searchKey="email"
  searchPlaceholder="Filter by email..."
  showColumnToggle
/>
```

### StatCard

```tsx
import { StatCard } from '@/components/composed'
import { Users } from 'lucide-react'
;<StatCard
  title="Total Clients"
  value={42}
  icon={Users}
  trend={{ value: 12.5, label: 'from last month' }}
/>
```

### EmptyState

```tsx
import { EmptyState } from '@/components/composed'
import { Users } from 'lucide-react'
;<EmptyState
  icon={Users}
  title="No clients yet"
  description="Get started by adding your first client."
  action={{ label: 'Add Client', onClick: openModal }}
/>
```

### DatePicker

```tsx
import { DatePicker } from '@/components/composed'
;<DatePicker value={selectedDate} onChange={setSelectedDate} placeholder="Pick a date" />
```

### Combobox

```tsx
import { Combobox } from '@/components/composed'
;<Combobox
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]}
  value={status}
  onChange={setStatus}
  placeholder="Select status..."
/>
```

### FileUpload

```tsx
import { FileUpload } from '@/components/composed'
;<FileUpload
  onUpload={(files) => handleUpload(files)}
  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
  maxFiles={5}
/>
```

## File Structure

Each component has its own directory with:

```
<component-name>/
├── <ComponentName>.tsx       # Component implementation
├── <ComponentName>.stories.tsx  # Storybook stories
└── index.ts                  # Barrel export
```

## Creating New Composed Components

1. Create directory: `apps/web/src/components/composed/<component-name>/`
2. Create component file with JSDoc documentation
3. Create barrel export (`index.ts`)
4. Add Storybook story
5. Export from `apps/web/src/components/composed/index.ts`
