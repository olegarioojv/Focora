import { useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNotesStore, resolveNoteLinks } from '@/stores/notes-store'
import { remarkInlineMarks } from '@/lib/remark-inline-marks'

interface NoteMarkdownViewProps {
  content: string
  onNavigate: (noteId: string) => void
}

const NOTE_LINK_REGEX = /\[\[([^\]]+)\]\]/g

export function NoteMarkdownView({ content, onNavigate }: NoteMarkdownViewProps) {
  const notes = useNotesStore((state) => state.notes)

  const resolvedLinks = useMemo(
    () => resolveNoteLinks(content, notes),
    [content, notes],
  )

  const processedContent = useMemo(
    () => content.replace(NOTE_LINK_REGEX, (_match, title: string) => `[${title}](note:${title})`),
    [content],
  )

  const components: Components = useMemo(
    () => ({
      a: ({ href, children, ...props }) => {
        if (href && href.startsWith('note:')) {
          const title = href.slice(5)
          const resolvedId = resolvedLinks.get(title)

          if (resolvedId) {
            return (
              <button
                type="button"
                onClick={() => onNavigate(resolvedId)}
                className="text-primary underline underline-offset-2"
              >
                {children}
              </button>
            )
          }

          return (
            <button
              type="button"
              onClick={() => {
                useNotesStore
                  .getState()
                  .addNote({ title, content: '' })
                  .then((newNote) => onNavigate(newNote.id))
                  .catch(() => {
                    // errors already surfaced via toast in the store
                  })
              }}
              className="text-muted-foreground underline decoration-dashed"
            >
              {children}
            </button>
          )
        }

        return (
          <a href={href} target="_blank" rel="noreferrer" {...props}>
            {children}
          </a>
        )
      },
    }),
    [resolvedLinks, onNavigate],
  )

  return (
    <div
      className={[
        '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:first:mt-0',
        '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-primary',
        '[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-foreground',
        '[&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-foreground',
        '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1',
        '[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-0',
        '[&_li.task-list-item]:flex [&_li.task-list-item]:items-center [&_li.task-list-item]:gap-2',
        '[&_input[type=checkbox]]:h-4 [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:accent-primary',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
        '[&_mark]:rounded [&_mark]:bg-yellow-300/80 [&_mark]:px-0.5 [&_mark]:text-neutral-900',
        '[&_u]:underline [&_u]:decoration-2 [&_u]:underline-offset-2',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3',
        '[&_blockquote]:my-4 [&_blockquote]:rounded-lg [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-foreground [&_blockquote_p]:mb-0',
        '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_table]:text-sm',
        '[&_th]:border-b [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground',
        '[&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-foreground [&_tr:last-child_td]:border-b-0',
        'text-sm text-foreground',
      ].join(' ')}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkInlineMarks]} components={components}>
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
