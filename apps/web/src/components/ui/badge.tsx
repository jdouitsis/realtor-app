import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-semantic-success/10 text-status-active-text',
        warning: 'bg-semantic-warning/10 text-status-invited-text',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border border-border text-foreground',
      },
      status: {
        active: 'bg-status-active/10 text-status-active-text border border-status-active/20',
        invited: 'bg-status-invited/10 text-status-invited-text border border-status-invited/20',
        inactive:
          'bg-status-inactive/10 text-status-inactive-text border border-status-inactive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for displaying labels, tags, and status indicators.
 *
 * @example
 * // Basic usage with variant
 * <Badge variant="success">Completed</Badge>
 *
 * @example
 * // Status badge with built-in styling
 * <Badge status="active">Active</Badge>
 * <Badge status="invited">Invited</Badge>
 * <Badge status="inactive">Inactive</Badge>
 */
function Badge({ className, variant, status, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant: status ? undefined : variant, status, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
