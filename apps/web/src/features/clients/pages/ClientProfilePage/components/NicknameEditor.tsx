import { InlineEditor } from '@/components/ui'
import { trpc } from '@/lib/trpc'

interface NicknameEditorProps {
  clientId: string
  nickname: string | null
}

export function NicknameEditor({ clientId, nickname }: NicknameEditorProps) {
  const utils = trpc.useUtils()

  const updateNickname = trpc.clients.updateNickname.useMutation({
    onMutate: async ({ nickname: newNickname }) => {
      await utils.clients.getById.cancel({ id: clientId })
      const previousData = utils.clients.getById.getData({ id: clientId })

      if (previousData) {
        utils.clients.getById.setData({ id: clientId }, { ...previousData, nickname: newNickname })
      }

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        utils.clients.getById.setData({ id: clientId }, context.previousData)
      }
    },
    onSettled: () => {
      void utils.clients.getById.invalidate({ id: clientId })
      void utils.clients.list.invalidate()
    },
  })

  const handleSave = (newNickname: string | null) => {
    if (newNickname !== nickname) {
      updateNickname.mutate({ id: clientId, nickname: newNickname })
    }
  }

  return (
    <InlineEditor
      value={nickname}
      onSave={handleSave}
      placeholder="Enter nickname..."
      emptyText="Add a nickname"
    />
  )
}
