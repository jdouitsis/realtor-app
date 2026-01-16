import { Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui'
import { trpc } from '@/lib/trpc'

interface NicknameEditorProps {
  clientId: string
  nickname: string | null
  name: string
}

export function NicknameEditor({ clientId, nickname, name }: NicknameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(nickname ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const utils = trpc.useUtils()

  const updateNickname = trpc.clients.updateNickname.useMutation({
    onMutate: async ({ nickname: newNickname }) => {
      // Cancel outgoing refetches
      await utils.clients.getById.cancel({ id: clientId })

      // Snapshot previous value
      const previousData = utils.clients.getById.getData({ id: clientId })

      // Optimistically update
      if (previousData) {
        utils.clients.getById.setData(
          { id: clientId },
          {
            ...previousData,
            nickname: newNickname,
          }
        )
      }

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.clients.getById.setData({ id: clientId }, context.previousData)
      }
    },
    onSettled: () => {
      // Invalidate to sync with server
      void utils.clients.getById.invalidate({ id: clientId })
      void utils.clients.list.invalidate()
    },
  })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmedValue = value.trim()
    const newNickname = trimmedValue === '' ? null : trimmedValue

    // Only save if value changed
    if (newNickname !== nickname) {
      updateNickname.mutate({ id: clientId, nickname: newNickname })
    }

    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setValue(nickname ?? '')
      setIsEditing(false)
    }
  }

  const handleClick = () => {
    setValue(nickname ?? '')
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="mt-4 text-xl font-semibold text-center h-auto py-1 border-0 focus-visible:ring-0"
        placeholder="Add nickname..."
        maxLength={100}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 text-center group cursor-pointer hover:bg-muted/50 rounded-lg px-3 py-1 -mx-3 transition-colors"
    >
      {nickname ? (
        <>
          <div className="relative flex items-center justify-center">
            <span className="text-xl font-semibold">{nickname}</span>
            <Pencil className="absolute -right-6 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-sm text-muted-foreground">{name}</p>
        </>
      ) : (
        <div className="relative flex items-center justify-center">
          <span className="text-xl font-semibold">{name}</span>
          <Pencil className="absolute -right-6 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </button>
  )
}
