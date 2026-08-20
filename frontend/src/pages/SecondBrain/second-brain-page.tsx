import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { QuickCreateMenu } from './components/quick-create-menu'
import { SearchCommand } from './components/search-command'
import { SectionNav, type SecondBrainSection } from './components/section-nav'
import { NotesListPanel } from './components/notes-list-panel'
import { NoteEditor } from './components/note-editor'
import { FlashcardsPanel } from './components/flashcards-panel'
import { ReviewsPanel } from './components/reviews-panel'
import { useNotesStore } from '@/stores/notes-store'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { useState } from 'react'

export function SecondBrainPage() {
  const navigate = useNavigate()
  const { noteId } = useParams<{ noteId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<SecondBrainSection>('notas')
  const [searchOpen, setSearchOpen] = useState(false)

  const notes = useNotesStore((state) => state.notes)
  const addNote = useNotesStore((state) => state.addNote)
  const subjectFilter = searchParams.get('subject')

  const selectedNote = noteId ? notes.find((n) => n.id === noteId) ?? null : null

  function selectNote(id: string) {
    navigate(`/app/brain/${id}`, { replace: true })
  }

  function setSubjectFilter(subjectId: string | null) {
    const next = new URLSearchParams(searchParams)
    if (subjectId) next.set('subject', subjectId)
    else next.delete('subject')
    setSearchParams(next, { replace: true })
  }

  async function handleNewNote() {
    const note = await addNote({ title: 'Nova nota', content: '' })
    setActiveSection('notas')
    selectNote(note.id)
  }

  useKeyboardShortcut('n', () => void handleNewNote())
  useKeyboardShortcut('k', () => setSearchOpen(true))

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app"
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Início
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Segundo Cérebro
          </h1>
          <p className="text-sm text-muted-foreground">
            Sua base de conhecimento pessoal — notas, flashcards e revisões.
          </p>
        </div>
        <QuickCreateMenu
          onNewNote={() => void handleNewNote()}
          onNewFlashcard={() => setActiveSection('flashcards')}
          onNewReview={() => setActiveSection('revisoes')}
        />
      </div>

      <Card
        size="sm"
        className="grid grid-cols-1 divide-y divide-border p-0 lg:h-[calc(100vh-260px)] lg:min-h-[560px] lg:grid-cols-[260px_1fr] lg:divide-x lg:divide-y-0 lg:overflow-hidden"
      >
        <div className="flex h-full flex-col gap-4 bg-muted/20 p-4 lg:overflow-y-auto">
          <SectionNav active={activeSection} onChange={setActiveSection} />

          {activeSection === 'notas' && (
            <NotesListPanel
              selectedNoteId={noteId ?? null}
              onSelect={selectNote}
              subjectFilter={subjectFilter}
              onSubjectFilterChange={setSubjectFilter}
              onNewNote={() => void handleNewNote()}
            />
          )}
        </div>

        {activeSection === 'notas' && (
          <NoteEditor note={selectedNote} onNavigate={selectNote} />
        )}
        {activeSection === 'flashcards' && (
          <div className="h-full p-6 lg:overflow-y-auto">
            <FlashcardsPanel subjectFilter={subjectFilter} />
          </div>
        )}
        {activeSection === 'revisoes' && (
          <div className="h-full p-6 lg:overflow-y-auto">
            <ReviewsPanel />
          </div>
        )}
      </Card>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigateToNote={(id) => {
          setActiveSection('notas')
          selectNote(id)
        }}
      />
    </div>
  )
}
