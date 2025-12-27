import * as React from 'react'

import { cn } from '@/lib/utils'

interface OTPInputProps {
  /** Number of OTP digits */
  length?: number
  /** Current value (string of digits) */
  value: string
  /** Called when value changes */
  onChange: (value: string) => void
  /** Called when all digits are filled */
  onComplete?: (value: string) => void
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input has an error */
  hasError?: boolean
  /** ID for accessibility - associates with external label */
  id?: string
  /** Class name for the container */
  className?: string
}

// Stable keys for OTP digit positions - avoids ESLint array-index-key warning
const DIGIT_KEYS = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'] as const

const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(
  (
    { length = 6, value, onChange, onComplete, disabled = false, hasError = false, id, className },
    ref
  ) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    // Expose the first input via forwarded ref for external focus control
    React.useImperativeHandle(ref, () => inputRefs.current[0]!, [])

    // Stable array of digit positions
    const positions = React.useMemo(() => Array.from({ length }, (_, i) => i), [length])

    // Get digit at position from value string
    const getDigit = (position: number) => value[position] || ''

    // Build new value string with digit at position
    const setDigitAt = (position: number, digit: string): string => {
      const chars = value.padEnd(length, '').split('')
      chars[position] = digit
      // Trim trailing empty chars and join
      return chars.join('').replace(/\s+$/, '')
    }

    const focusInput = (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus()
      }
    }

    const handleChange = (position: number, inputValue: string) => {
      // Only allow single digits
      const digit = inputValue.replace(/\D/g, '').slice(-1)

      if (digit) {
        const newValue = setDigitAt(position, digit)
        onChange(newValue)

        // Auto-advance to next input
        if (position < length - 1) {
          focusInput(position + 1)
        }

        // Check if complete (all digits filled)
        if (newValue.length === length && onComplete) {
          onComplete(newValue)
        }
      }
    }

    const handleKeyDown = (position: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Backspace':
          e.preventDefault()
          if (getDigit(position)) {
            // Clear current digit
            onChange(setDigitAt(position, ''))
          } else if (position > 0) {
            // Move to previous and clear it
            onChange(setDigitAt(position - 1, ''))
            focusInput(position - 1)
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          focusInput(position - 1)
          break

        case 'ArrowRight':
          e.preventDefault()
          focusInput(position + 1)
          break

        case 'Delete':
          e.preventDefault()
          if (getDigit(position)) {
            onChange(setDigitAt(position, ''))
          }
          break
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text')
      const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length)

      if (pastedDigits) {
        onChange(pastedDigits)

        // Focus the last filled input or the next empty one
        const lastFilledIndex = Math.min(pastedDigits.length, length) - 1
        focusInput(lastFilledIndex < length - 1 ? lastFilledIndex + 1 : lastFilledIndex)

        // Check if complete (all digits filled)
        if (pastedDigits.length === length && onComplete) {
          onComplete(pastedDigits)
        }
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select content on focus for easy replacement
      e.target.select()
    }

    return (
      <div
        role="group"
        aria-labelledby={id ? `${id}-label` : undefined}
        className={cn('flex gap-2', className)}
      >
        {positions.map((position) => (
          <input
            key={DIGIT_KEYS[position]}
            ref={(el) => {
              inputRefs.current[position] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={position === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            value={getDigit(position)}
            onChange={(e) => handleChange(position, e.target.value)}
            onKeyDown={(e) => handleKeyDown(position, e)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            aria-label={`Digit ${position + 1} of ${length}`}
            aria-invalid={hasError}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-md border border-input bg-transparent text-center text-xl font-semibold shadow-sm transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        ))}
      </div>
    )
  }
)
OTPInput.displayName = 'OTPInput'

export { OTPInput }
export type { OTPInputProps }
