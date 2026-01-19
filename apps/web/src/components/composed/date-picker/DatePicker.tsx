import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Date picker component combining Calendar with Popover.
 *
 * @example
 * <DatePicker
 *   value={selectedDate}
 *   onChange={(date) => setSelectedDate(date)}
 *   placeholder="Pick a date"
 * />
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
