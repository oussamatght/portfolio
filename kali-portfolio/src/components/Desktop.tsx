import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Battery,
  Code2,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Link2 as Github,
  HardDrive,
  LayoutGrid,
  Power,
  Search,
  Terminal as TerminalIcon,
  Trash2,
  Volume2,
  Wifi,
  X,
} from "lucide-react";

import DesktopIcon from "./DesktopIcon";
import FileManager from "./FileManager";
import TerminalApp from "./TerminalApp";
import WindowFrame from "./WindowFrame";
import { projects } from "../data/projects";
import dragonWallpaper from "../assets/Neon Dragon Linux Tech Wallpaper.png";

type WindowKind = "files" | "terminal" | "about";

type DesktopWindow = {
  id: string;
  kind: WindowKind;
  projectId?: string;
  zIndex: number;
  minimized: boolean;
};

// Replace these placeholder destinations with your real profiles before publishing.
const PROFILE_LINKS = [
  { label: "GitHub", href: "https://github.com/", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Globe },
  { label: "Email", href: "mailto:kali@portfolio.dev", icon: FileText },
];

const APP_LABELS: Record<WindowKind, string> = {
  files: "Files",
  terminal: "Terminal",
  about: "About",
};

function formatWindowLabel(item: DesktopWindow) {
  if (item.kind !== "files" || !item.projectId) return APP_LABELS[item.kind];
  return projects.find((project) => project.id === item.projectId)?.name ?? "Project files";
}

function SystemMetric({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.35)]"
          style={{ width }}
        />
      </div>
    </div>
  );
}

export default function Desktop() {
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  const openWindow = useCallback((kind: WindowKind, projectId?: string) => {
    setWindows((current) => {
      const topZ = current.reduce((max, item) => Math.max(max, item.zIndex), 20);
      const existing = current.find(
        (item) => item.kind === kind && item.projectId === projectId,
      );

      if (existing) {
        return current.map((item) =>
          item.id === existing.id
            ? { ...item, minimized: false, zIndex: topZ + 1 }
            : item,
        );
      }

      const id = `${kind}-${projectId ?? "root"}`;
      return [
        ...current,
        {
          id,
          kind,
          projectId,
          zIndex: topZ + 1,
          minimized: false,
        },
      ];
    });
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((current) => current.filter((item) => item.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, minimized: true } : item)),
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((current) => {
      const topZ = current.reduce((max, item) => Math.max(max, item.zIndex), 20);
      return current.map((item) =>
        item.id === id ? { ...item, minimized: false, zIndex: topZ + 1 } : item,
      );
    });
  }, []);

  const clock = useMemo(
    () =>
      now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [now],
  );
  const date = useMemo(
    () =>
      now.toLocaleDateString([], {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [now],
  );

  const filteredApps = [
    { label: "Terminal", kind: "terminal" as const, icon: TerminalIcon },
    { label: "File Manager", kind: "files" as const, icon: FolderOpen },
    { label: "About Oussama", kind: "about" as const, icon: Code2 },
  ].filter((app) => app.label.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <div className="desktop-in relative h-dvh min-h-[520px] w-full select-none overflow-hidden bg-[#050913] text-cyan-50">
      {/* Wallpaper. Put your landscape wallpaper at public/wallpaper.jpg for the closest match. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/wallpaper.jpg'), url(${dragonWallpaper})`,
          backgroundPosition: "center",
          backgroundSize: "cover, cover",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,18,.52),rgba(2,8,18,.14)_44%,rgba(2,8,18,.72))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_43%,rgba(14,165,164,.13),transparent_50%)]"
      />

      <div className="relative flex h-full min-h-0 flex-col">
        {/* Top bar */}
        <header className="relative z-40 flex h-11 shrink-0 items-center gap-3 border-b border-cyan-300/15 bg-[#050913]/75 px-3 backdrop-blur-xl sm:px-5">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
          >
            <span className="grid size-7 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.08)]">
              <Code2 size={17} />
            </span>
            <span className="text-xs font-semibold tracking-wide text-slate-100">Oussama OS</span>
          </button>
          <span className="hidden h-4 w-px bg-cyan-200/20 sm:block" />
          <span className="hidden text-xs text-cyan-100/65 sm:block">Portfolio workspace</span>
          <span className="flex-1" />
          <div className="flex items-center gap-3 text-cyan-100/75">
            <span className="hidden items-center gap-1.5 sm:flex" title="Network connected">
              <Wifi size={14} />
            </span>
            <span className="hidden sm:block" title="Audio">
              <Volume2 size={14} />
            </span>
            <span className="hidden sm:block" title="Power status">
              <Battery size={15} />
            </span>
            <button
              type="button"
              aria-label="Search applications"
              onClick={() => {
                setSearchOpen((open) => !open);
                setMenuOpen(false);
              }}
              className="rounded-md p-1.5 transition hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <Search size={15} />
            </button>
            <div className="min-w-[74px] text-right font-mono leading-tight">
              <div className="text-xs font-semibold tabular-nums text-cyan-300">{clock}</div>
              <div className="mt-0.5 hidden text-[9px] text-slate-400 md:block">{date}</div>
            </div>
            <button
              type="button"
              aria-label="Open power and session menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-md p-1.5 transition hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <Power size={15} />
            </button>
          </div>
        </header>

        {/* Application menu */}
        {menuOpen && (
          <div className="desktop-menu absolute left-3 top-12 z-[70] w-60 overflow-hidden rounded-xl border border-cyan-300/20 bg-[#08111d]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:left-5">
            <div className="border-b border-cyan-200/10 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[.24em] text-cyan-300/60">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Oussama OS</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">oussama@linux:~</p>
            </div>
            <div className="p-2">
              {[
                { label: "Terminal", icon: TerminalIcon, action: () => openWindow("terminal") },
                { label: "File manager", icon: FolderOpen, action: () => openWindow("files") },
                { label: "About this portfolio", icon: Code2, action: () => openWindow("about") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    <Icon size={15} className="text-cyan-300" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* App search */}
        {searchOpen && (
          <div className="absolute left-1/2 top-14 z-[70] w-[min(420px,calc(100vw-28px))] -translate-x-1/2 overflow-hidden rounded-xl border border-cyan-300/20 bg-[#08111d]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="flex items-center gap-2 border-b border-cyan-200/10 px-3">
              <Search size={15} className="text-cyan-300" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search apps..."
                aria-label="Search applications"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-2">
              {filteredApps.length ? filteredApps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.kind}
                    type="button"
                    onClick={() => openWindow(app.kind)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-cyan-300/10"
                  >
                    <Icon size={17} className="text-cyan-300" />
                    {app.label}
                  </button>
                );
              }) : (
                <p className="px-3 py-4 text-xs text-slate-500">No matching applications.</p>
              )}
            </div>
          </div>
        )}

        {/* Desktop workspace */}
        <main className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Left desktop shortcuts */}
          <nav aria-label="Desktop shortcuts" className="relative z-10 flex w-[76px] shrink-0 flex-col items-center gap-2 overflow-y-auto px-2 py-4 sm:w-[92px] sm:gap-3 sm:px-3 sm:py-5">
            <DesktopIcon
              label="Terminal"
              icon={<TerminalIcon size={25} />}
              selected={selectedIcon === "terminal"}
              onSelect={() => setSelectedIcon("terminal")}
              onOpen={() => openWindow("terminal")}
            />
            <DesktopIcon
              label="Files"
              icon={<FolderOpen size={25} />}
              selected={selectedIcon === "files"}
              onSelect={() => setSelectedIcon("files")}
              onOpen={() => openWindow("files")}
            />
            <DesktopIcon
              label="Browser"
              icon={<Globe size={25} />}
              selected={selectedIcon === "browser"}
              onSelect={() => setSelectedIcon("browser")}
              onOpen={() => openWindow("about")}
            />
            <DesktopIcon
              label="Resume"
              icon={<FileText size={24} />}
              selected={selectedIcon === "resume"}
              onSelect={() => setSelectedIcon("resume")}
              onOpen={() => openWindow("about")}
            />
            {projects.map((project) => (
              <DesktopIcon
                key={project.id}
                label={project.name}
                icon={<Folder size={24} style={{ color: project.accent || "#38bdf8" }} />}
                selected={selectedIcon === project.id}
                onSelect={() => setSelectedIcon(project.id)}
                onOpen={() => openWindow("files", project.id)}
              />
            ))}
            <div className="my-1 h-px w-8 shrink-0 bg-cyan-200/15" />
            <DesktopIcon
              label="Trash"
              icon={<Trash2 size={23} />}
              selected={selectedIcon === "trash"}
              onSelect={() => setSelectedIcon("trash")}
              onOpen={() => openWindow("files")}
            />
          </nav>

          {/* Central identity */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center px-4 pb-10 sm:pb-14">
            <div className="max-w-xl text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-cyan-300/25 bg-[#06101b]/50 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,.12)] backdrop-blur-md sm:size-14">
                <Code2 size={27} strokeWidth={1.4} />
              </div>
              <h1 className="text-3xl font-black tracking-[.22em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,.8)] sm:text-5xl">
                OUSS<span className="text-cyan-300">A</span>MA
              </h1>
              <p className="mt-3 text-[9px] font-medium tracking-[.38em] text-cyan-100/75 sm:text-xs sm:tracking-[.48em]">
                FULL STACK DEVELOPER
              </p>
              <div className="mx-auto mt-4 flex items-center justify-center gap-3 font-mono text-[9px] tracking-widest text-slate-400/80">
                <span className="h-px w-8 bg-cyan-300/60" />
                BUILD · SHIP · REPEAT
                <span className="h-px w-8 bg-cyan-300/60" />
              </div>
            </div>
          </div>

          {/* Right-side system monitor */}
          <aside className="absolute right-4 top-5 z-10 hidden w-48 border-l border-cyan-300/35 pl-4 text-slate-200/90 xl:block 2xl:right-7 2xl:top-8 2xl:w-52" aria-label="Decorative system status">
            <div className="font-mono text-4xl font-light tracking-wider text-cyan-300">{clock}</div>
            <p className="mt-1 text-[10px] text-slate-400">{date}</p>
            <div className="my-4 h-px bg-cyan-300/45" />
            <p className="text-xs leading-relaxed text-slate-300">Code today,<br />build tomorrow.</p>
            <p className="mt-2 text-[10px] text-cyan-300">— Oussama</p>

            <div className="my-4 h-px bg-cyan-300/35" />
            <h2 className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.25em] text-cyan-200/85">
              <Activity size={12} /> System
            </h2>
            <div className="space-y-4">
              <SystemMetric label="CPU" value="12%" width="12%" />
              <SystemMetric label="RAM" value="4.1 / 15.4 GB" width="27%" />
              <SystemMetric label="GPU" value="3%" width="3%" />
            </div>
            <div className="my-4 h-px bg-cyan-300/35" />
            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.25em] text-cyan-200/85">
              <HardDrive size={12} /> Workspace
            </h2>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Projects</span>
              <span className="font-mono text-cyan-100">{projects.length.toString().padStart(2, "0")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Session</span>
              <span className="font-mono text-emerald-300">ACTIVE</span>
            </div>
          </aside>

          {/* Helpful shortcut hint */}
          <div className="absolute bottom-5 right-4 z-10 hidden items-center gap-2 rounded-lg border border-cyan-200/15 bg-[#06101b]/45 px-3 py-2 font-mono text-[9px] text-slate-300/70 backdrop-blur-md md:flex xl:right-60">
            <LayoutGrid size={12} className="text-cyan-300/80" />
            double-click an icon to open
          </div>

          {/* Existing interactive apps/windows */}
          {windows.map((item) => {
            if (item.minimized) return null;

            if (item.kind === "terminal") {
              return (
                <TerminalApp
                  key={item.id}
                  zIndex={item.zIndex}
                  onClose={() => closeWindow(item.id)}
                  onMinimize={() => minimizeWindow(item.id)}
                  onOpenProject={(id) => openWindow("files", id)}
                />
              );
            }

            if (item.kind === "about") {
              return (
                <WindowFrame
                  key={item.id}
                  title="About — Oussama OS"
                  icon={<Code2 size={14} />}
                  zIndex={item.zIndex}
                  onClose={() => closeWindow(item.id)}
                  onMinimize={() => minimizeWindow(item.id)}
                  initialPosition={{ x: 260, y: 130 }}
                  initialSize={{ width: 460, height: 390 }}
                >
                  <div className="h-full overflow-y-auto p-6 text-sm text-cyan-50/85">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
                        <Code2 size={25} />
                      </div>
                      <div>
                        <h2 className="font-mono text-xl tracking-widest text-cyan-100">OUSSAMA</h2>
                        <p className="mt-1 font-mono text-[10px] tracking-[.2em] text-cyan-300/60">FULL STACK DEVELOPER</p>
                      </div>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      Welcome to my Linux-inspired portfolio workspace. Explore the projects, open the terminal, or browse the file manager to discover my work and development setup.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.04] p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Projects</p>
                        <p className="mt-1 font-mono text-xl text-cyan-200">{projects.length.toString().padStart(2, "0")}</p>
                      </div>
                      <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.04] p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">Environment</p>
                        <p className="mt-1 font-mono text-sm text-cyan-200">React + Linux</p>
                      </div>
                    </div>
                    <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.24em] text-slate-400">Find me online</h3>
                    <ul className="mt-3 space-y-2">
                      {PROFILE_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 transition hover:text-white"
                            >
                              <Icon size={13} /> {link.label} <span aria-hidden="true">↗</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-5 text-[10px] leading-relaxed text-slate-500">
                      Update the profile links in Desktop.tsx with your real accounts before publishing.
                    </p>
                  </div>
                </WindowFrame>
              );
            }

            return (
              <FileManager
                key={item.id}
                zIndex={item.zIndex}
                initialProjectId={item.projectId}
                onClose={() => closeWindow(item.id)}
              />
            );
          })}
        </main>

        {/* Bottom taskbar / dock */}
        <footer className="relative z-40 flex h-10 shrink-0 items-center gap-2 border-t border-cyan-300/15 bg-[#050913]/70 px-3 backdrop-blur-xl sm:px-5">
          <span className="flex items-center gap-2 font-mono text-[10px] text-slate-300/70">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.8)]" />
            <span className="hidden sm:inline">session active</span>
          </span>
          <span className="flex-1" />
          <div className="flex items-center gap-1.5 rounded-xl border border-cyan-200/15 bg-[#07111d]/80 p-1 shadow-[0_8px_35px_rgba(0,0,0,.35)]">
            {[
              { label: "Terminal", icon: TerminalIcon, action: () => openWindow("terminal") },
              { label: "Files", icon: FolderOpen, action: () => openWindow("files") },
              { label: "Projects", icon: Code2, action: () => openWindow("files") },
              { label: "About", icon: Globe, action: () => openWindow("about") },
              { label: "Applications", icon: LayoutGrid, action: () => setMenuOpen((open) => !open) },
            ].map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.label}
                  type="button"
                  title={app.label}
                  aria-label={app.label}
                  onClick={app.action}
                  className="grid size-8 place-items-center rounded-lg text-cyan-100/80 transition hover:bg-cyan-300/15 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 sm:size-9"
                >
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
          <span className="flex-1" />
          <div className="hidden min-w-[100px] items-center justify-end gap-2 text-[10px] text-slate-400 sm:flex">
            <Activity size={13} className="text-teal-300" />
            <span className="font-mono">oussama@linux</span>
          </div>
        </footer>

        {/* Window switcher: minimized windows remain available from the taskbar. */}
        {windows.some((item) => item.minimized) && (
          <div className="absolute bottom-14 left-1/2 z-[65] flex max-w-[calc(100vw-24px)] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-cyan-200/15 bg-[#07111d]/90 p-2 shadow-2xl backdrop-blur-xl">
            {windows.filter((item) => item.minimized).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => focusWindow(item.id)}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-xs text-cyan-100/80 transition hover:bg-cyan-300/10 hover:text-white"
              >
                {formatWindowLabel(item)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
