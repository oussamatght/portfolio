/**
 * File Manager virtual filesystem (UI simulation only).
 * ID-based tree with parent links, persisted via localStorage move
 * overrides so user-arranged items survive page refreshes. The terminal's
 * static tree in `vfs.ts` is intentionally kept separate.
 */

export type FmNode = {
  id: string
  name: string
  kind: 'folder' | 'file'
  parentId: string
  meta?: string
  /** Synthetic shortcut folder (never movable, never a drop target). */
  target?: 'projects' | 'featured'
  /** Project folder rendered from projects data (not movable). */
  projectId?: string
}

export const FM_ROOT_ID = 'root'

const BASE_NODES: FmNode[] = [
  {
    id: FM_ROOT_ID,
    name: 'kali',
    kind: 'folder',
    parentId: FM_ROOT_ID,
  },
  {
    id: 'fm-projects',
    name: 'Projects',
    kind: 'folder',
    parentId: FM_ROOT_ID,
    target: 'projects',
  },
  {
    id: 'fm-featured',
    name: 'Featured',
    kind: 'folder',
    parentId: FM_ROOT_ID,
    target: 'featured',
  },
  { id: 'fm-desktop', name: 'Desktop', kind: 'folder', parentId: FM_ROOT_ID },
  { id: 'fm-documents', name: 'Documents', kind: 'folder', parentId: FM_ROOT_ID },
  { id: 'fm-downloads', name: 'Downloads', kind: 'folder', parentId: FM_ROOT_ID },
  { id: 'fm-pictures', name: 'Pictures', kind: 'folder', parentId: FM_ROOT_ID },
  { id: 'fm-readme', name: 'readme.txt', kind: 'file', parentId: FM_ROOT_ID, meta: '1 KB' },
  {
    id: 'fm-note-desktop',
    name: 'session-notes.txt',
    kind: 'file',
    parentId: 'fm-desktop',
    meta: '620 B',
  },
  {
    id: 'fm-cv',
    name: 'oussamaCV.pdf',
    kind: 'file',
    parentId: 'fm-documents',
    meta: '112 KB',
  },
  {
    id: 'fm-backup',
    name: 'backup.zip',
    kind: 'file',
    parentId: 'fm-downloads',
    meta: '2.3 MB',
  },
  {
    id: 'fm-wallpaper',
    name: 'wallpaper.jpg',
    kind: 'file',
    parentId: 'fm-pictures',
    meta: '842 KB',
  },
]

const BASE_ORDER = new Map(BASE_NODES.map((node, index) => [node.id, index]))

const FM_MOVES_KEY = 'kali-fm-moves-v1'

export function loadFmMoves(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FM_MOVES_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const moves: Record<string, string> = {}
      for (const [id, parentId] of Object.entries(parsed)) {
        if (typeof id === 'string' && typeof parentId === 'string') {
          moves[id] = parentId
        }
      }
      return moves
    }
  } catch {
    // Corrupted or unavailable storage — fall back to the pristine tree.
  }
  return {}
}

export function saveFmMoves(moves: Record<string, string>): void {
  try {
    localStorage.setItem(FM_MOVES_KEY, JSON.stringify(moves))
  } catch {
    // Storage may be full or blocked; the session keeps working in memory.
  }
}

/** True when `maybeAncestorId` is a parent (any depth) of the node `id`. */
export function isDescendantOf(
  nodes: Map<string, FmNode>,
  id: string,
  maybeAncestorId: string,
): boolean {
  let current: FmNode | undefined = nodes.get(id)
  while (current && current.id !== FM_ROOT_ID) {
    if (current.parentId === maybeAncestorId) return true
    current = nodes.get(current.parentId)
  }
  return false
}

/**
 * A drop is valid when the target is a real (non-shortcut) folder that is
 * not the item itself, not its current parent (no-op), and not one of the
 * item's descendants (which would create a circular relationship).
 */
export function isValidFmDrop(
  nodes: Map<string, FmNode>,
  movingId: string,
  targetId: string,
): boolean {
  if (movingId === targetId) return false
  const moving = nodes.get(movingId)
  if (!moving) return false
  const target = nodes.get(targetId)
  if (!target || target.kind !== 'folder' || target.target || target.projectId) {
    return false
  }
  if (moving.parentId === targetId) return false
  return !isDescendantOf(nodes, targetId, movingId)
}

/** Apply persisted move overrides on top of the pristine tree, safely. */
export function buildFmNodes(moves: Record<string, string>): Map<string, FmNode> {
  const nodes = new Map<string, FmNode>()
  for (const base of BASE_NODES) {
    nodes.set(base.id, { ...base })
  }

  for (const [id, parentId] of Object.entries(moves)) {
    const node = nodes.get(id)
    if (!node || node.id === FM_ROOT_ID) continue
    if (parentId === FM_ROOT_ID) {
      node.parentId = FM_ROOT_ID
      continue
    }
    const parent = nodes.get(parentId)
    if (!parent || parent.kind !== 'folder') continue
    if (parent.target || parent.projectId) continue
    if (id === parentId) continue
    if (isDescendantOf(nodes, parentId, id)) continue
    node.parentId = parentId
  }

  return nodes
}

/** Children of a folder: folders first, then base-arrival order. */
export function listFmChildren(
  nodes: Map<string, FmNode>,
  parentId: string,
): FmNode[] {
  return [...nodes.values()]
    .filter((node) => node.parentId === parentId && node.id !== FM_ROOT_ID)
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
      return (BASE_ORDER.get(a.id) ?? 0) - (BASE_ORDER.get(b.id) ?? 0)
    })
}

/** Names from just below the root down to the given folder. */
export function fmPathChain(
  nodes: Map<string, FmNode>,
  folderId: string,
): string[] {
  const segments: string[] = []
  let current: FmNode | undefined = nodes.get(folderId)
  while (current && current.id !== FM_ROOT_ID) {
    segments.unshift(current.name)
    current = nodes.get(current.parentId)
  }
  return segments
}
