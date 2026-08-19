import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuickCreateMenu } from './components/quick-create-menu'
import { SearchCommand } from './components/search-command'
import { NotesListPanel } from './components/notes-list-panel'
import { NoteEditor } from './components/note-editor'
import { RelatedNotesPanel } from './components/related-notes-panel'
import { FlashcardsPanel } from './components/flashcards-panel'
import { ReviewsPanel } from './components/reviews-panel'
import { useNotesStore } from '@/stores/notes-store'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { useState } from 'react'

type SecondBrainTab = 'notas' | 'flashcards' | 'revisoes'

export function SecondBrainPage() {
  const navigate = useNavigate()
  const { noteId } = useParams<{ noteId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<SecondBrainTab>('notas')
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
    setActiveTab('notas')
    selectNote(note.id)
  }

  useKeyboardShortcut('n', () => void handleNewNote())
  useKeyboardShortcut('k', () => setSearchOpen(true))

  return (
    <div className="flex flex-col gap-6">
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
          onNewFlashcard={() => setActiveTab('flashcards')}
          onNewReview={() => setActiveTab('revisoes')}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SecondBrainTab)}
      >
        <TabsList>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="revisoes">Revisões</TabsTrigger>
        </TabsList>

        <TabsContent value="notas">
          <Card
            size="sm"
            className="grid grid-cols-1 divide-y divide-border p-0 lg:h-[calc(100vh-260px)] lg:min-h-[560px] lg:grid-cols-[260px_1fr_260px] lg:divide-x lg:divide-y-0 lg:overflow-hidden"
          >
            <NotesListPanel
              selectedNoteId={noteId ?? null}
              onSelect={selectNote}
              subjectFilter={subjectFilter}
              onSubjectFilterChange={setSubjectFilter}
              onNewNote={() => void handleNewNote()}
            />
            <NoteEditor note={selectedNote} onNavigate={selectNote} />
            <RelatedNotesPanel note={selectedNote} onNavigate={selectNote} />
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <FlashcardsPanel subjectFilter={subjectFilter} />
        </TabsContent>

        <TabsContent value="revisoes">
          <ReviewsPanel />
        </TabsContent>
      </Tabs>

      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigateToNote={(id) => {
          setActiveTab('notas')
          selectNote(id)
        }}
      />
    </div>
  )
}
