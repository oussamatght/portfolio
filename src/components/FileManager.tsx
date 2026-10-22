import { useState } from 'react'
import type { ReactNode } from 'react'
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

type Location = 'home' | 'projects' | 'featured' | 'project'

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
}

type ProjectLinkEntry = {
  label: string
  url: string
  icon: ReactNode
}

const HOME_ENTRIES: Entry[] = [
  { name: 'Projects', kind: 'folder', target: 'projects' },
  { name: 'Featured', kind: 'folder', target: 'featured' },
  { name: 'Desktop', kind: 'folder' },
  { name: 'Documents', kind: 'folder' },
  { name: 'Downloads', kind: 'folder' },
  { name: 'Pictures', kind: 'folder' },
  { name: 'readme.txt', kind: 'file', size: '1 KB' },
]

function ProjectThumb({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${project.accent}33, #0b0f16 70%)`,
        }}
      >
        <span
          className="font-mono text-3xl font-bold"
          style={{ color: project.accent }}
        >
          {project.name.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={project.image}
      alt={project.name}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
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

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const selectedProject = projects.find((project) => project.id === selected) ?? null
  const selectedLinks = selectedProject ? projectLinkEntries(selectedProject) : []

  const path =
    location === 'home'
      ? '/home/kali'
      : location === 'featured'
        ? '/home/kali/featured'
        : location === 'projects'
          ? '/home/kali/projects'
          : (activeProject?.path ?? '/home/kali')

  const entries: Entry[] =
    location === 'home'
      ? HOME_ENTRIES
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
          : (activeProject?.files ?? []).map((file) => ({ ...file }))

  const visibleEntries = entries.filter((entry) =>
    entry.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

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
    }
  }

  const goUp = () => {
    if (location === 'project') {
      setLocation('projects')
      setSelected(null)
    } else if (location === 'featured') {
      setLocation('home')
      setSelected(null)
    } else if (location === 'projects') {
      setLocation('home')
      setSelected(null)
    }
  }

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
            className="rounded-md border border-cyan-300/20 px-2 py-1 font-mono text-xs text-cyan-200/80 transition hover:bg-cyan-400/10 hover:text-cyan-100"
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
        </div>

        <div className="flex min-h-0 flex-1">
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

          <div className="min-w-0 flex-1 overflow-y-auto p-4 @container">
            {visibleEntries.length === 0 ? (
              <p className="font-mono text-xs text-cyan-300/50">No entries found.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 @min-[420px]:grid-cols-3 @min-[480px]:grid-cols-4">
                {visibleEntries.map((entry) => {
                  const isFolder = entry.kind === 'folder'
                  const isActive = selected === entry.name || selected === entry.projectId
                  return (
                    <li key={entry.name}>
                      <button
                        type="button"
                        onClick={(event) => {
                          setSelected(entry.projectId ?? entry.name)
                          if (isCoarsePointer || event.detail === 0) openEntry(entry)
                        }}
                        onDoubleClick={() => openEntry(entry)}
                        className={`flex w-full flex-col items-center gap-2 rounded-lg border p-3 transition ${
                          isActive
                            ? 'border-cyan-300/50 bg-cyan-400/15'
                            : 'border-transparent hover:border-cyan-300/25 hover:bg-white/5'
                        }`}
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
            <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-cyan-300/10 p-3 @2xl/fm:block">
              <div className="h-36 overflow-hidden rounded-lg border border-cyan-300/20">
                <ProjectThumb project={selectedProject} />
              </div>
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
      </div>
    </WindowFrame>
  )
}
