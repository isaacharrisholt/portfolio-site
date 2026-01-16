export interface LineContent {
  text: string
  link?: string
}

export interface FileChange {
  remove?: LineContent[]
  add?: LineContent[]
  insertAfter?: string
}

export interface ChangelogEntry {
  hash: string
  date: string
  message: string
  description?: string
  changes: Record<string, FileChange[]>
}

export interface InitialCommit {
  hash: string
  date: string
  message: string
  description?: string
}

export interface DiffPageData {
  initial: Record<string, LineContent[]>
  initialCommit?: InitialCommit
  changelog: ChangelogEntry[]
}

export interface WordSegment {
  text: string
  changed: boolean
}

export interface WordDiffLine {
  type: '+' | '-'
  segments: WordSegment[]
  link?: string
}

export interface ProcessedHunk {
  file: string
  lines: (WordDiffLine | { type: ' '; content: string; link?: string })[]
}

export interface ProcessedEntry {
  hash: string
  date: string
  message: string
  description?: string
  hunks: ProcessedHunk[]
}

export interface ProcessedDiffData {
  currentState: Record<string, LineContent[]>
  processedEntries: ProcessedEntry[]
}

// Output types for component rendering
export interface FileViewSection {
  filename: string
  lines: { content: string; link?: string }[]
}

export interface DiffEntryLine {
  type: '+' | '-' | ' '
  content?: string
  segments?: WordSegment[]
  link?: string
}

export interface DiffEntryHunk {
  file: string
  lines: DiffEntryLine[]
}

export interface DiffEntryData {
  hash: string
  date: string
  message: string
  description?: string
  hunks: DiffEntryHunk[]
}
