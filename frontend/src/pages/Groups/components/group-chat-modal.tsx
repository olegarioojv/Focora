import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { groupsApi, type GroupChatMessage } from '@/services/groups-api'
import { ApiError } from '@/services/api-client'

const POLL_MS = 4_000
// How close to the bottom the user has to be scrolled for a new message to
// auto-scroll into view — far enough that reading older messages isn't
// interrupted by unrelated chat activity.
const AUTO_SCROLL_THRESHOLD_PX = 80

interface GroupChatModalProps {
  groupId: string
  currentUserId?: string
  hasUnread?: boolean
  onRead?: () => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GroupChatModal({
  groupId,
  currentUserId,
  hasUnread = false,
  onRead,
}: GroupChatModalProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastCreatedAtRef = useRef<string | null>(null)

  function isNearBottom() {
    const el = scrollRef.current
    if (!el) return true
    return (
      el.scrollHeight - el.scrollTop - el.clientHeight < AUTO_SCROLL_THRESHOLD_PX
    )
  }

  function scrollToBottom() {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  // Only load/poll while the modal is actually open — no point spending
  // requests on a chat nobody is looking at.
  useEffect(() => {
    if (!open) return

    setMessages([])
    lastCreatedAtRef.current = null
    setLoading(true)

    // Marking read on close too (not just open) covers messages that
    // streamed in via polling while the modal stayed open.
    groupsApi.markMessagesRead(groupId).then(onRead).catch(() => {})

    groupsApi
      .listMessages(groupId)
      .then((initial) => {
        setMessages(initial)
        lastCreatedAtRef.current = initial.at(-1)?.createdAt ?? null
        requestAnimationFrame(scrollToBottom)
      })
      .catch(() => {
        // Polling picks this up on the next tick — no need to surface a
        // toast for a background load.
      })
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      // No `after` yet (chat still empty from this client's view) — poll
      // the same way as the initial load instead of skipping the tick,
      // otherwise a chat that started empty never picks up its first
      // incoming message.
      groupsApi
        .listMessages(groupId, lastCreatedAtRef.current ?? undefined)
        .then((incoming) => {
          if (incoming.length === 0) return
          const shouldStickToBottom = isNearBottom()
          lastCreatedAtRef.current = incoming.at(-1)?.createdAt ?? lastCreatedAtRef.current
          setMessages((prev) => {
            const existingIds = new Set(prev.map((message) => message.id))
            return [...prev, ...incoming.filter((message) => !existingIds.has(message.id))]
          })
          if (shouldStickToBottom) requestAnimationFrame(scrollToBottom)
        })
        .catch(() => {
          // Transient failure — the next poll tick retries.
        })
    }, POLL_MS)

    return () => {
      clearInterval(interval)
      groupsApi.markMessagesRead(groupId).then(onRead).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, open])

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    try {
      const message = await groupsApi.sendMessage(groupId, content)
      setInput('')
      lastCreatedAtRef.current = message.createdAt
      setMessages((prev) => [...prev, message])
      requestAnimationFrame(scrollToBottom)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Não foi possível enviar a mensagem',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Abrir chat do grupo"
        >
          <MessageCircle className="h-4 w-4" />
          {hasUnread && (
            <span
              title="Novas mensagens"
              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-destructive"
            />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat do grupo</DialogTitle>
        </DialogHeader>

        <div
          ref={scrollRef}
          className="flex max-h-96 min-h-60 flex-col gap-3 overflow-y-auto"
        >
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Carregando mensagens...
            </p>
          ) : messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Diga oi! 👋
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.userId === currentUserId
              return (
                <div
                  key={message.id}
                  className={cn('flex items-end gap-2', isMine && 'flex-row-reverse')}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={message.userAvatarUrl ?? undefined} alt={message.userName} />
                    <AvatarFallback className="bg-primary/15 text-[10px] font-medium text-primary">
                      {message.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('flex max-w-[75%] flex-col gap-0.5', isMine && 'items-end')}>
                    {!isMine && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {message.userName}
                      </span>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-1.5 text-sm break-words',
                        isMine
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm bg-muted text-foreground',
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Escreva uma mensagem..."
            value={input}
            maxLength={1000}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              void handleSend()
            }}
          />
          <Button
            type="button"
            size="icon"
            disabled={!input.trim() || sending}
            onClick={() => void handleSend()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
