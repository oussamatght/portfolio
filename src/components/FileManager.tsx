import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import {
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Folder,
  FolderGit2,
  FolderOpen,
  Globe,
  HardDrive,
  Home,
  Play,
  Search,
  Server,
  Smartphone,
  Star,
} from 'lucide-react'
import WindowFrame from './WindowFrame'
import { featuredProjects, projects, type Project } from '../data/projects'
import { useCoarsePointer } from '../hooks/useCoarsePointer'
import {
  FM_ROOT_ID,
  buildFmNodes,
  fmPathChain,
  isValidFmDrop,
  listFmChildren,
  loadFmMoves,
  saveFmMoves,
  type FmNode,
} from '../lib/fmFs'

type Location = 'home' | 'projects' | 'featured' | 'project' | 'folder'

type FileManagerProps = {
  onClose: () => void
  onMinimize?: () => void
  zIndex?: number
  hidden?: boolean
  initialProjectId?: string
}

type Entry = {
  name: string
  kind: 'folder' | 'file'
  size?: string
  meta?: string
  target?: Location
  projectId?: string
  /** FM-tree node id; present only for entries that live in the real tree. */
  nodeId?: string
}

type DragState = {
  pointerId: number
  nodeId: string
  name: string
  kind: 'folder' | 'file'
  startX: number
  startY: number
  x: number
  y: number
  active: boolean
}

const DRAG_THRESHOLD = 7
const DROP_ATTR = 'data-fm-drop'

function MediaThumb({
  src,
  accent,
  initial,
  alt,
  label,
  compact = false,
  baseHeight = 'h-36',
  portraitHeight = 'h-96',
  className = '',
}: {
  src: string
  accent: string
  initial: string
  alt: string
  label?: string
  compact?: boolean
  baseHeight?: string
  portraitHeight?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [portrait, setPortrait] = useState(false)

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-cyan-300/20 ${
        portrait ? portraitHeight : baseHeight
      } ${className}`}
    >
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-cyan-300/[.06]" />
      )}
      {failed ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}33, #0b0f16 70%)`,
          }}
        >
          <span
            className={`font-mono font-bold ${compact ? 'text-lg' : 'text-3xl'}`}
            style={{ color: accent }}
          >
            {initial}
          </span>
        </div>
      ) : (
        <img
          key={attempt}
          src={attempt > 0 ? `${src}?r=${attempt}` : src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            const image = event.currentTarget
            setPortrait(image.naturalHeight > image.naturalWidth)
            setLoaded(true)
          }}
          onError={() => {
            if (attempt < 2) {
              window.setTimeout(() => setAttempt((current) => current + 1), 300)
            } else {
              setFailed(true)
            }
          }}
          className={`h-full w-full ${portrait ? 'object-contain' : 'object-cover object-top'}`}
        />
      )}
      {label && (
        <span className="absolute bottom-1 left-1 rounded bg-[#050913]/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-100">
          {label}
        </span>
      )}
    </div>
  )
}

type ProjectLinkEntry = {
  label: string
  url: string
  icon: ReactNode
}

function projectLinkEntries(project: Project): ProjectLinkEntry[] {
  if (!project.links) return []

  const entries: ProjectLinkEntry[] = []
  if (project.links.github) {
    entries.push({
      label: 'Source code',
      url: project.links.github,
      icon: <FolderGit2 size={13} />,
    })
  }
  if (project.links.live) {
    entries.push({
      label: 'Live demo',
      url: project.links.live,
      icon: <Globe size={13} />,
    })
  }
  if (project.links.backend) {
    entries.push({
      label: 'Backend repo',
      url: project.links.backend,
      icon: <Server size={13} />,
    })
  }
  if (project.links.playStore) {
    entries.push({
      label: 'Google Play',
      url: project.links.playStore,
      icon: <Play size={13} />,
    })
  }
  if (project.links.appStore) {
    entries.push({
      label: 'App Store',
      url: project.links.appStore,
      icon: <Smartphone size={13} />,
    })
  }
  if (project.links.apk) {
    entries.push({
      label: 'Download APK',
      url: project.links.apk,
      icon: <Download size={13} />,
    })
  }
  for (const extra of project.links.extra ?? []) {
    if (!extra.url) continue
    entries.push({
      label: extra.label || extra.url,
      url: extra.url,
      icon: <ExternalLink size={13} />,
    })
  }
  return entries
}

export default function FileManager({ onClose, onMinimize, zIndex = 10, hidden = false, initialProjectId }: FileManagerProps) {
  const isCoarsePointer = useCoarsePointer()
  const initial = projects.find((project) => project.id === initialProjectId)
  const [location, setLocation] = useState<Location>(initial ? 'project' : 'home')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initial?.id ?? null)
  const [selected, setSelected] = useState<string | null>(initial?.id ?? null)
  const [query, setQuery] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [moves, setMoves] = useState<Record<string, string>>(() => loadFmMoves())
  const [drag, setDrag] = useState<DragState | null>(null)
  const [hover, setHover] = useState<{ id: string; valid: boolean } | null>(null)

  const nodes = useMemo(() => buildFmNodes(moves), [moves])
  const nodesRef = useRef(nodes)
  const dragRef = useRef<DragState | null>(null)
  const hoverRef = useRef<{ id: string; valid: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])
  useEffect(() => {
    hoverRef.current = hover
  }, [hover])

  const applyMove = useCallback((nodeId: string, targetId: string) => {
    setMoves((previous) => {
      if (previous[nodeId] === targetId) return previous
      const next = { ...previous, [nodeId]: targetId }
      saveFmMoves(next)
      return next
    })
  }, [])

  // Global pointer bookkeeping for drag & drop (mouse + touch).
  useEffect(() => {
    const hitTest = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y) as HTMLElement | null
      const dropHost = element?.closest(`[${DROP_ATTR}]`) as HTMLElement | null
      if (!dropHost || !dragRef.current) {
        setHover(null)
        return
      }
      const targetId = dropHost.getAttribute(DROP_ATTR) ?? ''
      const valid = isValidFmDrop(nodesRef.current, dragRef.current.nodeId, targetId)
      setHover((previous) =>
        previous?.id === targetId && previous.valid === valid
          ? previous
          : { id: targetId, valid },
      )
    }

    const onPointerMove = (event: PointerEvent) => {
      const state = dragRef.current
      if (!state || state.pointerId !== event.pointerId) return

      if (!state.active) {
        const distance = Math.hypot(
          event.clientX - state.startX,
          event.clientY - state.startY,
        )
        if (distance < DRAG_THRESHOLD) return
        state.active = true
      }

      state.x = event.clientX
      state.y = event.clientY
      setDrag({ ...state })
      hitTest(event.clientX, event.clientY)
      if (event.cancelable) event.preventDefault()
    }

    const endDrag = (event: PointerEvent, committed: boolean) => {
      const state = dragRef.current
      if (!state) return
      const wasActive = state.active

      if (
        committed &&
        wasActive &&
        event.type === 'pointerup' &&
        hoverRef.current?.valid
      ) {
        applyMove(state.nodeId, hoverRef.current.id)
      }
      if (wasActive) suppressClickRef.current = true

      dragRef.current = null
      setDrag(null)
      setHover(null)
    }

    const onPointerUp = (event: PointerEvent) => endDrag(event, true)
    const onPointerCancel = (event: PointerEvent) => endDrag(event, false)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !dragRef.current) return
      dragRef.current = null
      setDrag(null)
      setHover(null)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [applyMove])

  const startTileDrag = useCallback(
    (entry: Entry, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!entry.nodeId || entry.target || entry.projectId) return
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (!event.isPrimary) return

      suppressClickRef.current = false
      dragRef.current = {
        pointerId: event.pointerId,
        nodeId: entry.nodeId,
        name: entry.name,
        kind: entry.kind,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        active: false,
      }
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Some browsers refuse capture; window listeners still cover it.
      }
    },
    [],
  )

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const selectedProject = projects.find((project) => project.id === selected) ?? null
  const selectedGallery = selectedProject?.gallery && selectedProject.gallery.length > 1 ? selectedProject.gallery : null
  const selectedLinks = selectedProject ? projectLinkEntries(selectedProject) : []

  const folderChain =
    location === 'folder' && currentFolderId
      ? fmPathChain(nodes, currentFolderId)
      : null

  const path =
    location === 'home'
      ? '/home/kali'
      : location === 'featured'
        ? '/home/kali/featured'
        : location === 'projects'
          ? '/home/kali/projects'
          : folderChain
            ? `/home/kali/${folderChain.join('/')}`
            : (activeProject?.path ?? '/home/kali')

  const entriesFromNodes = useCallback(
    (parentId: string): Entry[] =>
      listFmChildren(nodes, parentId).map((node: FmNode) => ({
        name: node.name,
        kind: node.kind,
        meta: node.meta,
        nodeId: node.id,
        target: node.target,
        projectId: node.projectId,
      })),
    [nodes],
  )

  const entries: Entry[] =
    location === 'home'
      ? entriesFromNodes(FM_ROOT_ID)
      : location === 'featured'
        ? featuredProjects().map((project) => ({
            name: project.name,
            kind: 'folder' as const,
            projectId: project.id,
            meta: project.year,
          }))
        : location === 'projects'
          ? projects.map((project) => ({
              name: project.name,
              kind: 'folder' as const,
              projectId: project.id,
              meta: project.year,
            }))
          : location === 'folder' && currentFolderId
            ? entriesFromNodes(currentFolderId)
            : (activeProject?.files ?? []).map((file) => ({ ...file }))

  const visibleEntries = entries.filter((entry) =>
    entry.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const selectedNode = selected ? nodes.get(selected) : undefined
  const movableSelected =
    selectedNode && !selectedNode.target && !selectedNode.projectId
      ? selectedNode
      : null

  const openEntry = (entry: Entry) => {
    if (entry.kind !== 'folder') return
    if (entry.target) {
      setLocation(entry.target)
      setSelected(null)
      return
    }
    if (entry.projectId) {
      setLocation('project')
      setActiveProjectId(entry.projectId)
      setSelected(entry.projectId)
      return
    }
    if (entry.nodeId) {
      setLocation('folder')
      setCurrentFolderId(entry.nodeId)
      setSelected(null)
    }
  }

  const goUp = () => {
    if (location === 'project') {
      setLocation('projects')
      setSelected(null)
    } else if (location === 'folder' && currentFolderId) {
      const parentId = nodes.get(currentFolderId)?.parentId ?? FM_ROOT_ID
      if (parentId === FM_ROOT_ID) {
        setLocation('home')
        setCurrentFolderId(null)
      } else {
        setCurrentFolderId(parentId)
      }
      setSelected(null)
    } else if (location === 'featured') {
      setLocation('home')
      setSelected(null)
    } else if (location === 'projects') {
      setLocation('home')
      setSelected(null)
    }
  }

  // Inside a real folder, "../" doubles as the drop target for the parent.
  const parentDropId =
    location === 'folder' && currentFolderId
      ? (nodes.get(currentFolderId)?.parentId ?? FM_ROOT_ID)
      : null

  return (
    <WindowFrame
      title={`Files — ${path}`}
      icon={<FolderOpen size={14} />}
      onClose={onClose}
      onMinimize={onMinimize}
      zIndex={zIndex}
      hidden={hidden}
      initialPosition={{ x: 140, y: 90 }}
      initialSize={{ width: 940, height: 580 }}
    >
      {/* Container queries key every size decision to the window, not the viewport. */}
      <div className="@container/fm flex h-full flex-col text-sm text-cyan-50/90">
        <div className="flex flex-wrap items-center gap-2 border-b border-cyan-300/10 px-3 py-2">
          <button
            type="button"
            onClick={goUp}
            aria-label="Go up"
            data-fm-drop={parentDropId ?? undefined}
            className={`rounded-md border px-2 py-1 font-mono text-xs transition ${
              drag?.active && hover?.id === parentDropId && hover.valid
                ? 'border-cyan-300/80 bg-cyan-400/25 text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,0.35)]'
                : 'border-cyan-300/20 text-cyan-200/80 hover:bg-cyan-400/10 hover:text-cyan-100'
            }`}
          >
            ../
          </button>
          <div className="flex min-w-[48px] flex-1 items-center gap-1 overflow-hidden font-mono text-xs text-cyan-200/70">
            {path.split('/').filter(Boolean).map((segment, index) => (
              <span key={segment} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={11} className="opacity-50" />}
                <span className="truncate">{segment}</span>
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-md border border-cyan-300/20 px-2 py-1">
            <Search size={12} className="text-cyan-300/70" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="w-28 bg-transparent font-mono text-xs text-cyan-100 outline-none placeholder:text-cyan-300/40"
            />
          </div>
          {movableSelected && (
            <p className="w-full pl-1 font-mono text-[10px] text-cyan-300/50">
              Move "{movableSelected.name}" by dragging it onto a folder ( or ../ ).
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col @2xl/fm:flex-row">
          <aside className="hidden w-44 shrink-0 border-r border-cyan-300/10 p-3 @xl/fm:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300/40">
              Places
            </p>
            <ul className="space-y-1">
              {[
                { label: 'Home', icon: <Home size={13} />, target: 'home' as Location },
                { label: 'Featured', icon: <Star size={13} className="text-cyan-300" />, target: 'featured' as Location },
                { label: 'Projects', icon: <Folder size={13} />, target: 'projects' as Location },
                { label: 'File System', icon: <HardDrive size={13} />, target: 'home' as Location },
              ].map((place) => (
                <li key={place.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(place.target)
                      setSelected(null)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                      location === place.target && place.label !== 'File System'
                        ? 'bg-cyan-400/15 text-cyan-100'
                        : 'text-cyan-200/70 hover:bg-white/5 hover:text-cyan-100'
                    }`}
                  >
                    {place.icon}
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 @container">
            {visibleEntries.length === 0 ? (
              <p className="font-mono text-xs text-cyan-300/50">No entries found.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 @min-[420px]:grid-cols-3 @min-[480px]:grid-cols-4">
                {visibleEntries.map((entry) => {
                  const isFolder = entry.kind === 'folder'
                  const entryKey = entry.nodeId ?? entry.projectId ?? entry.name
                  const isActive = selected === entryKey
                  const isRealNode = Boolean(
                    entry.nodeId && !entry.target && !entry.projectId,
                  )
                  const isDropTarget =
                    Boolean(drag?.active) &&
                    hover?.id === entry.nodeId
                  const isDragSource =
                    Boolean(drag?.active) && drag?.nodeId === entry.nodeId
                  const tileClass = isActive
                    ? 'border-cyan-300/50 bg-cyan-400/15'
                    : 'border-transparent hover:border-cyan-300/25 hover:bg-white/5'
                  const dropClass = !isDropTarget
                    ? ''
                    : hover?.valid
                      ? 'border-cyan-300/80! bg-cyan-400/25! shadow-[0_0_18px_rgba(34,211,238,0.4)]'
                      : 'border-rose-400/70! bg-rose-400/10!'
                  const sourceClass = isDragSource ? 'opacity-35' : ''
                  const pointerClass = isRealNode
                    ? isDragSource
                      ? 'cursor-grabbing select-none touch-none'
                      : 'cursor-grab select-none touch-none'
                    : ''
                  return (
                    <li key={entryKey}>
                      <button
                        type="button"
                        data-fm-drop={
                          isRealNode && isFolder ? entry.nodeId : undefined
                        }
                        onPointerDown={(event) => {
                          startTileDrag(entry, event)
                        }}
                        onClick={(event) => {
                          if (suppressClickRef.current) return
                          setSelected(entryKey)
                          if (isCoarsePointer || event.detail === 0) openEntry(entry)
                        }}
                        onDoubleClick={() => openEntry(entry)}
                        className={`flex w-full flex-col items-center gap-2 rounded-lg border p-3 transition ${
                          tileClass
                        } ${dropClass} ${sourceClass} ${pointerClass}`}
                      >
                        {isFolder ? (
                          <FolderOpen size={30} className="text-cyan-300" />
                        ) : (
                          <FileText size={28} className="text-cyan-200/70" />
                        )}
                        <span className="truncate text-xs">{entry.name}</span>
                        {(entry.size ?? entry.meta) && (
                          <span className="font-mono text-[10px] text-cyan-300/40">
                            {entry.size ?? entry.meta}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selectedProject && (
            <aside className="max-h-[46%] w-full shrink-0 overflow-y-auto border-t border-cyan-300/10 p-3 @2xl/fm:max-h-full @2xl/fm:w-72 @2xl/fm:border-l @2xl/fm:border-t-0">
              {selectedGallery ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedGallery.map((shot, index) => (
                    <MediaThumb
                      key={shot}
                      src={shot}
                      accent={selectedProject.accent}
                      initial={selectedProject.name.charAt(0)}
                      compact
                      baseHeight="h-24"
                      portraitHeight="h-52"
                      className={
                        selectedGallery.length % 2 === 1 && index === selectedGallery.length - 1
                          ? 'col-span-2'
                          : ''
                      }
                      label={selectedProject.galleryLabels?.[index]}
                      alt={
                        selectedProject.galleryLabels?.[index]
                          ? `${selectedProject.name} — ${selectedProject.galleryLabels[index]}`
                          : `${selectedProject.name} screenshot ${index + 1}`
                      }
                    />
                  ))}
                </div>
              ) : (
                <MediaThumb
                  src={selectedProject.image}
                  accent={selectedProject.accent}
                  initial={selectedProject.name.charAt(0)}
                  alt={`${selectedProject.name} cover`}
                  portraitHeight="h-96"
                />
              )}
              <h3 className="mt-3 font-mono text-sm text-cyan-100">{selectedProject.name}</h3>
              {selectedProject.tagline && (
                <p className="mt-0.5 text-[11px] leading-snug" style={{ color: selectedProject.accent }}>
                  {selectedProject.tagline}
                </p>
              )}
              {selectedProject.badge && (
                <span
                  className="mt-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] leading-tight"
                  style={{
                    borderColor: `${selectedProject.accent}66`,
                    backgroundColor: `${selectedProject.accent}14`,
                    color: selectedProject.accent,
                  }}
                >
                  {selectedProject.badge}
                </span>
              )}
              <p className="mt-2 flex flex-wrap items-center gap-x-2 font-mono text-[10px] text-cyan-300/50">
                <span>{selectedProject.year}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{selectedProject.path}</span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-cyan-100/70">
                {selectedProject.description}
              </p>
              {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300/40">
                    Highlights
                  </p>
                  <ul className="space-y-1">
                    {selectedProject.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-1.5 text-[11px] leading-snug text-cyan-100/70"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-px shrink-0"
                          style={{ color: selectedProject.accent }}
                        >
                          ▸
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedProject.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-cyan-300/25 px-2 py-0.5 font-mono text-[10px] text-cyan-200/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {selectedLinks.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300/40">
                    Open on
                  </p>
                  <ul className="space-y-1.5">
                    {selectedLinks.map((link) => (
                      <li key={`${link.label}-${link.url}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                        >
                          <ExternalLink size={12} className="text-cyan-300/60" />
                          {link.icon}
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedProject.privateRepo && (
                <p className="mt-4 border-t border-cyan-300/10 pt-2 font-mono text-[10px] text-cyan-300/40">
                  Private repository — source not public.
                </p>
              )}
            </aside>
          )}
        </div>

        {drag?.active &&
          createPortal(
            <div
              style={{
                left: drag.x,
                top: drag.y,
                transform: 'translate(-50%, -130%) rotate(-2deg)',
              }}
              className="pointer-events-none fixed z-[9999] flex items-center gap-1.5 rounded-md border border-cyan-300/60 bg-[#050913]/90 px-2.5 py-1.5 font-mono text-[11px] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.4)] backdrop-blur-sm"
            >
              {drag.kind === 'folder' ? (
                <FolderOpen size={13} className="text-cyan-300" />
              ) : (
                <FileText size={13} className="text-cyan-200/80" />
              )}
              <span className="max-w-44 truncate">{drag.name}</span>
            </div>,
            document.body,
          )}
      </div>
    </WindowFrame>
  )
}
