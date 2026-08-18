import { useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useNotesStore, resolveNoteLinks } from '@/stores/notes-store'

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
      className="[&_h1]:text-xl [&_h1]:font-heading [&_h1]:font-semibold [&_h1]:mb-2 [&_h1]:mt-4 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:mb-2 [&_h2]:mt-4 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-1 [&_h3]:mt-3 [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground text-sm text-foreground"
    >
      <ReactMarkdown components={components}>{processedContent}</ReactMarkdown>
    </div>
  )
}
