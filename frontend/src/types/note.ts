export interface Note {
  id: string
  title: string
  content: string
  subjectId: string | null
  isFavorite: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  /** Target note ids this note links to. */
  outboundLinks: string[]
  /** Source note ids that link to this note (backlinks). */
  inboundLinks: string[]
}
