import { useState } from 'react'
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Home,
  Search,
  Trash2,
} from 'lucide-react'
import WindowFrame from './WindowFrame'
import { projects, type Project } from '../data/projects'

type Location = 'home' | 'projects' | 'project'

type FileManagerProps = {
  onClose: () => void
  zIndex?: number
  initialProjectId?: string
}

type Entry = {
  name: string
  kind: 'folder' | 'file'
  size?: string
  target?: string
  projectId?: string
}

const HOME_ENTRIES: Entry[] = [
  { name: 'Projects', kind: 'folder', target: 'projects' },
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

export default function FileManager({ onClose, zIndex = 10, initialProjectId }: FileManagerProps) {
  const initial = projects.find((project) => project.id === initialProjectId)
  const [location, setLocation] = useState<Location>(initial ? 'project' : 'home')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initial?.id ?? null)
  const [selected, setSelected] = useState<string | null>(initial?.id ?? null)
  const [query, setQuery] = useState('')

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null
  const selectedProject = projects.find((project) => project.id === selected) ?? null

  const path =
    location === 'home'
      ? '/home/kali'
      : location === 'projects'
        ? '/home/kali/projects'
        : (activeProject?.path ?? '/home/kali')

  const entries: Entry[] =
    location === 'home'
      ? HOME_ENTRIES
      : location === 'projects'
        ? projects.map((project) => ({
            name: project.name,
            kind: 'folder',
            projectId: project.id,
          }))
        : (activeProject?.files ?? []).map((file) => ({ ...file }))

  const visibleEntries = entries.filter((entry) =>
    entry.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const openEntry = (entry: Entry) => {
    if (entry.kind !== 'folder') return
    if (entry.target === 'projects') {
      setLocation('projects')
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
      zIndex={zIndex}
      initialPosition={{ x: 140, y: 90 }}
      initialSize={{ width: 940, height: 580 }}
    >
      <div className="flex h-full flex-col text-sm text-cyan-50/90">
        <div className="flex items-center gap-2 border-b border-cyan-300/10 px-3 py-2">
          <button
            type="button"
            onClick={goUp}
            aria-label="Go up"
            className="rounded-md border border-cyan-300/20 px-2 py-1 font-mono text-xs text-cyan-200/80 transition hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            ../
          </button>
          <div className="flex flex-1 items-center gap-1 overflow-hidden font-mono text-xs text-cyan-200/70">
            {path.split('/').filter(Boolean).map((segment, index) => (
              <span key={segment} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={11} className="opacity-50" />}
                <span className="truncate">{segment}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-md border border-cyan-300/20 px-2 py-1">
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
          <aside className="hidden w-44 shrink-0 border-r border-cyan-300/10 p-3 sm:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300/40">
              Places
            </p>
            <ul className="space-y-1">
              {[
                { label: 'Home', icon: <Home size={13} />, target: 'home' as Location },
                { label: 'Projects', icon: <Folder size={13} />, target: 'projects' as Location },
                { label: 'File System', icon: <HardDrive size={13} />, target: 'home' as Location },
                { label: 'Trash', icon: <Trash2 size={13} />, target: 'home' as Location },
              ].map((place) => (
                <li key={place.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(place.target)
                      setSelected(null)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                      location === place.target && place.label !== 'File System' && place.label !== 'Trash'
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

          <div className="min-w-0 flex-1 overflow-y-auto p-4">
            {visibleEntries.length === 0 ? (
              <p className="font-mono text-xs text-cyan-300/50">No entries found.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {visibleEntries.map((entry) => {
                  const isFolder = entry.kind === 'folder'
                  const isActive = selected === entry.name || selected === entry.projectId
                  return (
                    <li key={entry.name}>
                      <button
                        type="button"
                        onClick={() => setSelected(entry.projectId ?? entry.name)}
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
                        {'size' in entry && entry.size && (
                          <span className="font-mono text-[10px] text-cyan-300/40">{entry.size}</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selectedProject && (
            <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-cyan-300/10 p-3 lg:block">
              <div className="h-36 overflow-hidden rounded-lg border border-cyan-300/20">
                <ProjectThumb project={selectedProject} />
              </div>
              <h3 className="mt-3 font-mono text-sm text-cyan-100">{selectedProject.name}</h3>
              <p className="mt-1 font-mono text-[10px] text-cyan-300/50">{selectedProject.path}</p>
              <p className="mt-3 text-xs leading-relaxed text-cyan-100/70">
                {selectedProject.description}
              </p>
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
            </aside>
          )}
        </div>
      </div>
    </WindowFrame>
  )
}
