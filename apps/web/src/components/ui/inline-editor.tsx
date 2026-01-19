import { Pencil, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface InlineEditorProps {
  value: string | null
  onSave: (value: string | null) => void
  placeholder?: string
  emptyText?: string
  maxLength?: number
  className?: string
}

/**
 * An inline text editor that displays text and becomes editable on click.
 * Maintains the same size when switching between display and edit modes.
 *
 * @example
 * <InlineEditor
 *   value={nickname}
 *   onSave={(val) => updateNickname(val)}
 *   emptyText="Add a nickname"
 *   placeholder="Enter nickname..."
 * />
 */
export function InlineEditor({
  value,
  onSave,
  placeholder = 'Enter value...',
  emptyText = 'Add value',
  maxLength = 100,
  className,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmedValue = inputValue.trim()
    const newValue = trimmedValue === '' ? null : trimmedValue

    if (newValue !== value) {
      onSave(newValue)
    }

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setInputValue(value ?? '')
      setIsEditing(false)
    }
  }

  const handleClick = () => {
    setInputValue(value ?? '')
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'text-sm font-medium leading-5 bg-transparent border-none outline-none p-0 m-0 w-full',
          'transition-all duration-150',
          className
        )}
        style={{ boxShadow: '0 1px 0 0 hsl(var(--primary))' }}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    )
  }

  if (value) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group inline-flex items-center gap-1.5 cursor-pointer text-left',
          'transition-colors duration-150',
          className
        )}
      >
        <span className="text-sm font-medium leading-5">{value}</span>
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group inline-flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground',
        'transition-colors duration-150',
        className
      )}
    >
      <Plus className="h-3.5 w-3.5" />
      <span className="text-sm font-medium leading-5">{emptyText}</span>
    </button>
  )
}
