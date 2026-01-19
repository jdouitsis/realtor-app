import { ArrowDown, ArrowUp, type LucideIcon, Minus } from 'lucide-react'

import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  className?: string
}

/**
 * Metric display card with trend indicator.
 *
 * @example
 * <StatCard
 *   title="Total Clients"
 *   value={42}
 *   icon={Users}
 *   trend={{ value: 12.5, label: "from last month" }}
 * />
 */
export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  const trendDirection = trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : null

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tighter">{value}</p>
          </div>
          {Icon && (
            <div className="rounded-md bg-muted p-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            <TrendIcon direction={trendDirection} />
            <span
              className={cn(
                'font-medium',
                trendDirection === 'up' && 'text-green-600 dark:text-green-400',
                trendDirection === 'down' && 'text-red-600 dark:text-red-400',
                trendDirection === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend.value > 0 && '+'}
              {trend.value}%
            </span>
            {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'neutral' | null }) {
  if (direction === 'up') {
    return <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
  }
  if (direction === 'down') {
    return <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />
}
