import { diffWords } from 'diff'
import type {
  LineContent,
  DiffPageData,
  WordSegment,
  ProcessedHunk,
  ProcessedEntry,
  ProcessedDiffData,
  FileViewSection,
  DiffEntryData,
} from './types'

function cloneLines(lines: LineContent[]): LineContent[] {
  return lines.map((l) => ({ ...l }))
}

function insertLines(
  fileLines: LineContent[],
  linesToAdd: LineContent[],
  insertAfter: string | undefined,
  fallbackIdx: number,
): void {
  const newLines = cloneLines(linesToAdd)

  if (insertAfter !== undefined) {
    const idx = fileLines.findIndex((l) => l.text === insertAfter)
    if (idx !== -1) {
      fileLines.splice(idx + 1, 0, ...newLines)
      return
    }
  }

  // Use fallback position or append
  if (fallbackIdx >= 0) {
    fileLines.splice(Math.min(fallbackIdx, fileLines.length), 0, ...newLines)
  } else {
    fileLines.push(...newLines)
  }
}

export function computeCurrentState(data: DiffPageData): Record<string, LineContent[]> {
  const state: Record<string, LineContent[]> = {}

  // Start with initial state (deep clone)
  for (const [file, lines] of Object.entries(data.initial)) {
    state[file] = cloneLines(lines)
  }

  // Apply each changelog entry forward
  for (const entry of data.changelog) {
    for (const [file, changes] of Object.entries(entry.changes)) {
      if (!state[file]) {
        state[file] = []
      }

      for (const change of changes) {
        const fileLines = state[file]
        const hasRemovals = change.remove && change.remove.length > 0
        const hasAdditions = change.add && change.add.length > 0

        if (hasRemovals) {
          // Find position of first line to remove (for later insertion)
          const firstRemoveIdx = fileLines.findIndex(
            (l) => l.text === change.remove![0].text,
          )

          // Remove all specified lines
          for (const toRemove of change.remove!) {
            const idx = fileLines.findIndex((l) => l.text === toRemove.text)
            if (idx !== -1) {
              fileLines.splice(idx, 1)
            }
          }

          // Add new lines at the position where we removed
          if (hasAdditions) {
            insertLines(fileLines, change.add!, change.insertAfter, firstRemoveIdx)
          }
        } else if (hasAdditions) {
          // Pure addition (no removal) - append by default
          insertLines(fileLines, change.add!, change.insertAfter, -1)
        }
      }
    }
  }

  return state
}

export function computeWordDiff(
  oldText: string,
  newText: string,
): { oldSegments: WordSegment[]; newSegments: WordSegment[] } {
  const diff = diffWords(oldText, newText)

  const oldSegments: WordSegment[] = []
  const newSegments: WordSegment[] = []

  for (const part of diff) {
    if (part.added) {
      newSegments.push({ text: part.value, changed: true })
    } else if (part.removed) {
      oldSegments.push({ text: part.value, changed: true })
    } else {
      // Unchanged
      oldSegments.push({ text: part.value, changed: false })
      newSegments.push({ text: part.value, changed: false })
    }
  }

  return { oldSegments, newSegments }
}

function similarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  let matches = 0
  const aChars = new Map<string, number>()

  for (const c of aLower) {
    aChars.set(c, (aChars.get(c) || 0) + 1)
  }

  for (const c of bLower) {
    const count = aChars.get(c) || 0
    if (count > 0) {
      matches++
      aChars.set(c, count - 1)
    }
  }

  return (2 * matches) / (a.length + b.length)
}

interface LinePairing {
  removedIdx: number
  addedIdx: number
  oldSegments: WordSegment[]
  newSegments: WordSegment[]
}

export function pairSimilarLines(
  removed: LineContent[],
  added: LineContent[],
): {
  pairings: LinePairing[]
  unpairedRemoved: number[]
  unpairedAdded: number[]
} {
  const pairings: LinePairing[] = []
  const usedAdded = new Set<number>()
  const pairedRemoved = new Set<number>()

  // For each removed line, find best matching added line
  for (let ri = 0; ri < removed.length; ri++) {
    let bestIdx = -1
    let bestSim = 0.6 // Minimum threshold - must be fairly similar to pair

    for (let ai = 0; ai < added.length; ai++) {
      if (usedAdded.has(ai)) continue

      const sim = similarity(removed[ri].text, added[ai].text)
      if (sim > bestSim) {
        bestSim = sim
        bestIdx = ai
      }
    }

    if (bestIdx >= 0) {
      const { oldSegments, newSegments } = computeWordDiff(
        removed[ri].text,
        added[bestIdx].text,
      )
      pairings.push({
        removedIdx: ri,
        addedIdx: bestIdx,
        oldSegments,
        newSegments,
      })
      usedAdded.add(bestIdx)
      pairedRemoved.add(ri)
    }
  }

  const unpairedRemoved = removed.map((_, i) => i).filter((i) => !pairedRemoved.has(i))
  const unpairedAdded = added.map((_, i) => i).filter((i) => !usedAdded.has(i))

  return { pairings, unpairedRemoved, unpairedAdded }
}

export function processChangelog(data: DiffPageData): ProcessedDiffData {
  const currentState = computeCurrentState(data)
  const processedEntries: ProcessedEntry[] = []

  // Generate initial commit entry if specified
  if (data.initialCommit) {
    const initialHunks: ProcessedHunk[] = []

    for (const [file, lines] of Object.entries(data.initial)) {
      const hunkLines: ProcessedHunk['lines'] = []

      for (const line of lines) {
        hunkLines.push({
          type: '+',
          segments: [{ text: line.text, changed: false }],
          link: line.link,
        })
      }

      if (hunkLines.length > 0) {
        initialHunks.push({ file, lines: hunkLines })
      }
    }

    if (initialHunks.length > 0) {
      processedEntries.push({
        hash: data.initialCommit.hash,
        date: data.initialCommit.date,
        message: data.initialCommit.message,
        description: data.initialCommit.description,
        hunks: initialHunks,
      })
    }
  }

  for (const entry of data.changelog) {
    const hunks: ProcessedHunk[] = []

    for (const [file, changes] of Object.entries(entry.changes)) {
      const lines: ProcessedHunk['lines'] = []

      for (const change of changes) {
        const removed = change.remove || []
        const added = change.add || []

        if (removed.length === 0 && added.length === 0) continue

        // Filter out empty lines for pairing comparison
        const removedFiltered = removed.filter((l) => l.text !== '')
        const addedFiltered = added.filter((l) => l.text !== '')
        const { pairings } = pairSimilarLines(removedFiltered, addedFiltered)

        // Build lookup maps for paired lines (by text content for matching)
        const removedPairMap = new Map<string, LinePairing>()
        const addedPairMap = new Map<string, LinePairing>()
        for (const pair of pairings) {
          removedPairMap.set(removedFiltered[pair.removedIdx].text, pair)
          addedPairMap.set(addedFiltered[pair.addedIdx].text, pair)
        }

        // Git-style: all removals first, then all additions (preserving order and whitespace)
        for (const line of removed) {
          const pair = removedPairMap.get(line.text)
          if (pair) {
            lines.push({
              type: '-',
              segments: pair.oldSegments,
              link: line.link,
            })
          } else {
            lines.push({
              type: '-',
              segments: [{ text: line.text, changed: false }],
              link: line.link,
            })
          }
        }

        for (const line of added) {
          const pair = addedPairMap.get(line.text)
          if (pair) {
            lines.push({
              type: '+',
              segments: pair.newSegments,
              link: line.link,
            })
          } else {
            lines.push({
              type: '+',
              segments: [{ text: line.text, changed: false }],
              link: line.link,
            })
          }
        }
      }

      if (lines.length > 0) {
        hunks.push({ file, lines })
      }
    }

    if (hunks.length > 0) {
      processedEntries.push({
        hash: entry.hash,
        date: entry.date,
        message: entry.message,
        description: entry.description,
        hunks,
      })
    }
  }

  return { currentState, processedEntries }
}

export function toFileViewSections(
  state: Record<string, LineContent[]>,
): FileViewSection[] {
  return Object.entries(state).map(([filename, lines]) => ({
    filename,
    lines: lines.map((l) => ({ content: l.text, link: l.link })),
  }))
}

export function toDiffEntries(entries: ProcessedEntry[]): DiffEntryData[] {
  return entries.map((entry) => ({
    hash: entry.hash,
    date: entry.date,
    message: entry.message,
    description: entry.description,
    hunks: entry.hunks.map((hunk) => ({
      file: hunk.file,
      lines: hunk.lines.map((line) => {
        if ('segments' in line) {
          return { type: line.type, segments: line.segments, link: line.link }
        }
        return { type: line.type, content: line.content, link: line.link }
      }),
    })),
  }))
}
