import { useEffect, useState } from 'react'
import {
  Battery,
  Folder,
  FolderOpen,
  Globe,
  LayoutGrid,
  Power,
  Terminal as TerminalIcon,
  Trash2,
  Volume2,
  Wifi,
} from 'lucide-react'
import DesktopIcon from './DesktopIcon'
import FileManager from './FileManager'
import TerminalApp from './TerminalApp'
import WindowFrame from './WindowFrame'
import { projects } from '../data/projects'
import dragonWallpaper from '../assets/Neon Dragon Linux Tech Wallpaper.png'

type WindowKind = 'files' | 'terminal' | 'about'

type WindowState = {
  id: string
  kind: WindowKind
  projectId?: string
  zIndex: number
  minimized: boolean
}

const ABOUT_LINKS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'Email', href: 'mailto:kali@portfolio.dev' },
]

export default function Desktop() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const openWindow = (kind: WindowKind, projectId?: string) => {
    setWindows((current) => {
      const zIndex = current.reduce((max, item) => Math.max(max, item.zIndex), 10) + 1
      const existing = current.find((item) => item.kind === kind && item.projectId === projectId)
      if (existing) {
        return current.map((item) =>
          item.id === existing.id ? { ...item, minimized: false, zIndex } : item,
        )
      }
      return [
        ...current,
        { id: `${kind}-${projectId ?? 'root'}`, kind, projectId, zIndex, minimized: false },
      ]
    })
  }

  const closeWindow = (id: string) =>
    setWindows((current) => current.filter((item) => item.id !== id))

  const minimizeWindow = (id: string) =>
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, minimized: true } : item)),
    )

  const focusWindow = (id: string) => {
    setWindows((current) => {
      const zIndex = current.reduce((max, item) => Math.max(max, item.zIndex), 10) + 1
      return current.map((item) => (item.id === id ? { ...item, zIndex, minimized: false } : item))
    })
  }

  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString([], {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

  return (
    <div className="desktop-in relative h-full w-full overflow-hidden bg-[#070a0f] text-cyan-50">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/wallpaper.jpg'), url(${dragonWallpaper})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />

      <div className="relative flex h-full flex-col">
        <header className="relative z-30 flex h-9 shrink-0 items-center gap-3 border-b border-cyan-300/15 bg-black/60 px-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/15"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-cyan-400 to-teal-500 font-mono text-[10px] font-bold text-black">
              K
            </span>
            Applications
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <span className="font-mono text-[11px] text-cyan-300/60">kali-portfolio-os</span>
            <span className="h-3 w-px bg-cyan-300/20" />
            <span className="font-mono text-[11px] text-cyan-300/40">~ /home/kali</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3 text-cyan-200/70">
            <Wifi size={13} className="hidden sm:block" />
            <Volume2 size={13} className="hidden sm:block" />
            <Battery size={13} className="hidden sm:block" />
            <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-100/80">
              <span className="tabular-nums">{clock}</span>
              <span className="hidden text-cyan-300/50 sm:inline">{date}</span>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Power menu"
              className="rounded-md p-1 transition hover:bg-cyan-400/15 hover:text-cyan-100"
            >
              <Power size={14} />
            </button>
          </div>
        </header>

        {menuOpen && (
          <div className="desktop-menu absolute right-2 top-10 z-40 w-56 overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0b0f16]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <p className="border-b border-cyan-300/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300/50">
              Kali Portfolio OS
            </p>
            <ul className="p-1.5">
              {[
                { label: 'Terminal', icon: <TerminalIcon size={14} />, action: () => openWindow('terminal') },
                { label: 'File Manager', icon: <FolderOpen size={14} />, action: () => openWindow('files') },
                { label: 'About', icon: <Globe size={14} />, action: () => openWindow('about') },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => {
                      item.action()
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-cyan-100/85 transition hover:bg-cyan-400/15"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <main className="relative flex-1 overflow-hidden">
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            <DesktopIcon
              label="Terminal"
              icon={<TerminalIcon size={26} />}
              selected={selectedIcon === 'terminal'}
              onSelect={() => setSelectedIcon('terminal')}
              onOpen={() => openWindow('terminal')}
            />
            <DesktopIcon
              label="Files"
              icon={<FolderOpen size={26} />}
              selected={selectedIcon === 'files'}
              onSelect={() => setSelectedIcon('files')}
              onOpen={() => openWindow('files')}
            />
            {projects.map((project) => (
              <DesktopIcon
                key={project.id}
                label={project.name}
                icon={<Folder size={26} style={{ color: project.accent }} />}
                selected={selectedIcon === project.id}
                onSelect={() => setSelectedIcon(project.id)}
                onOpen={() => openWindow('files', project.id)}
              />
            ))}
            <DesktopIcon
              label="Trash"
              icon={<Trash2 size={24} />}
              selected={selectedIcon === 'trash'}
              onSelect={() => setSelectedIcon('trash')}
            />
          </div>

          <div className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-lg border border-cyan-300/20 bg-black/50 px-3 py-1.5 font-mono text-[10px] text-cyan-200/60 backdrop-blur md:flex">
            <LayoutGrid size={12} />
            double-click an icon to open
          </div>

          {windows.map((item) => {
            if (item.minimized) return null
            if (item.kind === 'terminal') {
              return (
                <TerminalApp
                  key={item.id}
                  zIndex={item.zIndex}
                  onClose={() => closeWindow(item.id)}
                  onMinimize={() => minimizeWindow(item.id)}
                  onOpenProject={(id) => openWindow('files', id)}
                />
              )
            }
            if (item.kind === 'about') {
              return (
                <WindowFrame
                  key={item.id}
                  title="About — Kali Portfolio OS"
                  icon={<Globe size={14} />}
                  zIndex={item.zIndex}
                  onClose={() => closeWindow(item.id)}
                  onMinimize={() => minimizeWindow(item.id)}
                  initialPosition={{ x: 260, y: 180 }}
                  initialSize={{ width: 460, height: 380 }}
                >
                  <div className="h-full overflow-y-auto p-6 text-sm text-cyan-50/85">
                    <h2 className="font-mono text-xl tracking-widest text-cyan-200">KALI</h2>
                    <p className="mt-1 font-mono text-xs text-cyan-300/50">PORTFOLIO OS v1.0</p>
                    <p className="mt-4 leading-relaxed text-cyan-100/70">
                      A Linux-inspired desktop experience built with React, Vite and Tailwind CSS.
                      Explore the projects, open a terminal, or use the file manager to browse the
                      filesystem.
                    </p>
                    <ul className="mt-5 space-y-2">
                      {ABOUT_LINKS.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-cyan-300 underline-offset-4 hover:text-cyan-100 hover:underline"
                          >
                            {link.label} →
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </WindowFrame>
              )
            }
            return (
              <FileManager
                key={item.id}
                zIndex={item.zIndex}
                initialProjectId={item.projectId}
                onClose={() => closeWindow(item.id)}
              />
            )
          })}
        </main>

        <footer className="relative z-30 flex h-9 shrink-0 items-center gap-2 border-t border-cyan-300/15 bg-black/60 px-3 backdrop-blur-md">
          <span className="flex items-center gap-2 font-mono text-[11px] text-cyan-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            system online
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {windows.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => focusWindow(item.id)}
                className="rounded-md px-2 py-1 font-mono text-[10px] text-cyan-200/70 transition hover:bg-cyan-400/15 hover:text-cyan-100"
              >
                {item.kind === 'terminal'
                  ? 'terminal'
                  : item.kind === 'about'
                    ? 'about'
                    : (projects.find((project) => project.id === item.projectId)?.name ?? 'files')}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
