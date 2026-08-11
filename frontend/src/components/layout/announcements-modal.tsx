import { Bell, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ANNOUNCEMENTS } from '@/data/announcements'
import {
  useAnnouncementsStore,
  hasUnreadAnnouncements,
} from '@/stores/announcements-store'

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function AnnouncementsModal() {
  const lastSeenId = useAnnouncementsStore((state) => state.lastSeenId)
  const markAllSeen = useAnnouncementsStore((state) => state.markAllSeen)
  const unread = hasUnreadAnnouncements(lastSeenId)

  return (
    <Dialog
      onOpenChange={(open) => {
        // Marking as seen on open (not on close) means the badge
        // disappears immediately when the user checks the list — no
        // reason to make them close the dialog first to clear it.
        if (open) markAllSeen()
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Novidades"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
        >
          <Bell className="h-4.5 w-4.5" />
          {unread && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Novidades
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[428px] flex-col gap-3 overflow-y-auto pr-1">
          {ANNOUNCEMENTS.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma novidade por enquanto.
            </p>
          )}
          {ANNOUNCEMENTS.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'rounded-lg border p-3',
                index === 0 ? 'border-primary/40 bg-primary/5' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatDate(item.date)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
