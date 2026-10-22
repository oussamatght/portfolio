import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Battery,
  Code2,
  Download,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  HardDrive,
  LayoutGrid,
  Mail,
  Power,
  Search,
  Terminal as TerminalIcon,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { Maximize, Minimize } from "lucide-react";
import DesktopIcon from "./DesktopIcon";
import FileManager from "./FileManager";
import TerminalApp from "./TerminalApp";
import WindowFrame from "./WindowFrame";
import { projects } from "../data/projects";
import { aboutInfo, instructorExperience, profile } from "../data/profile";
import { useCoarsePointer } from "../hooks/useCoarsePointer";
import dragonWallpaper from "../assets/Neon Dragon Developer Brandscape.png";
import profilePhoto from "../assets/BEST OUSSAMA PHOTO.png";

type WindowKind = "files" | "terminal" | "about";

type DesktopWindow = {
  id: string;
  kind: WindowKind;
  projectId?: string;
  zIndex: number;
  minimized: boolean;
};

const BASE_Z_INDEX = 20;

// Replace these profile URLs with your public profile URLs before publishing.
const PROFILE_LINKS = [
  { label: "GitHub", href: profile.github, icon: Code2 },
  { label: "LinkedIn", href: profile.linkedin, icon: Globe },
  { label: "Email", href: profile.emailHref, icon: Mail },
  {
    label: "Resume",
    href: profile.resumePath,
    icon: FileText,
    download: profile.resumeFileName,
  },
] as const;

const APP_LABELS: Record<WindowKind, string> = {
  files: "Files",
  terminal: "Terminal",
  about: "About",
};

const APPLICATIONS = [
  { label: "Terminal", kind: "terminal" as const, icon: TerminalIcon },
  { label: "File Manager", kind: "files" as const, icon: FolderOpen },
  { label: "About Oussama", kind: "about" as const, icon: Code2 },
];

function formatWindowLabel(item: DesktopWindow) {
  if (item.kind !== "files" || !item.projectId) return APP_LABELS[item.kind];
  return (
    projects.find((project) => project.id === item.projectId)?.name ??
    "Project files"
  );
}

function getTopZIndex(items: DesktopWindow[]) {
  return items.reduce(
    (highest, item) => Math.max(highest, item.zIndex),
    BASE_Z_INDEX,
  );
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
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.35)] transition-[width] duration-700"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/** Email entry: copies the address (mailto often silently no-ops with no mail client). */
function CopyEmailLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.emailLabel);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = profile.emailHref;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Click to copy email address"
      aria-label={`Copy email address ${profile.emailLabel}`}
      className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
    >
      <Mail size={13} />
      <span>{copied ? "Copied to clipboard!" : profile.emailLabel}</span>
    </button>
  );
}

/** Live GitHub contribution heatmap, rendered from real commit data. */
type ContributionDay = { date: string; count: number; level: number };

const CONTRIBUTION_LADDER = [
  "rgba(34, 211, 238, 0.07)",
  "rgba(34, 211, 238, 0.3)",
  "rgba(34, 211, 238, 0.55)",
  "rgba(34, 211, 238, 0.8)",
  "rgba(125, 230, 255, 1)",
];

function ContributionUniverse() {
  const [days, setDays] = useState<ContributionDay[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`https://github-contributions-api.jogruber.de/v4/${profile.githubUser}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad status"))))
      .then(
        (data: { contributions: ContributionDay[] }) => {
          const list = data.contributions ?? [];
          if (!list.length) throw new Error("no data");
          if (alive) setDays(list);
        }
      )
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed || !days) {
    if (failed) {
      return (
        <p className="font-mono text-[11px] leading-relaxed text-slate-400">
          Contribution grid unavailable right now —{" "}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 transition hover:text-white"
          >
            view my activity on GitHub ↗
          </a>
        </p>
      );
    }
    return (
      <div
        className="h-24 animate-pulse rounded-lg bg-slate-700/20"
        role="status"
        aria-label="Loading contribution grid"
      />
    );
  }

  // Trailing 365 days, oldest → newest, aligned to start on a Sunday.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  cutoff.setHours(0, 0, 0, 0);
  const year = days
    .filter((d) => new Date(`${d.date}T00:00:00`) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(`${year[0].date}T00:00:00`);
  first.setDate(first.getDate() - first.getDay());
  const total = year.reduce((sum, d) => sum + d.count, 0);
  const lastTime = new Date(`${year[year.length - 1].date}T00:00:00`).getTime();
  const weeks = Math.ceil((lastTime - first.getTime()) / 86400000 / 7) + 1;
  const cols: (ContributionDay | null)[][] = Array.from({ length: weeks }, () =>
    Array.from({ length: 7 }, () => null)
  );
  for (const day of year) {
    const col = Math.floor(
      (new Date(`${day.date}T00:00:00`).getTime() - first.getTime()) / 86400000 / 7
    );
    const row = new Date(`${day.date}T00:00:00`).getDay();
    if (row < 7 && cols[col]) cols[col][row] = day;
  }

  const CELL = 12;
  const GAP = 3;
  const width = weeks * (CELL + GAP);
  const height = 7 * (CELL + GAP) - GAP;

  return (
    <div className="overflow-hidden rounded-lg border border-cyan-300/15 bg-[#0a0f1c]/70 p-3 transition hover:border-cyan-300/30">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`GitHub contribution heatmap: ${total} commits in the last year`}
        className="h-auto w-full"
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.25))" }}
      >
        {cols.map((column, ci) =>
          column.map((day, ri) => {
            if (!day) return null;
            return (
              <rect
                key={day.date}
                x={ci * (CELL + GAP)}
                y={ri * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={3}
                fill={CONTRIBUTION_LADDER[Math.min(day.level, 4)]}
              >
                <title>{`${day.date}: ${day.count} commits`}</title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}

export default function Desktop() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isCoarsePointer = useCoarsePointer();
  const [windows, setWindows] = useState<DesktopWindow[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Escape closes transient UI and leaves the desktop itself untouched.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      setSearchOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, searchOpen]);

  const openWindow = useCallback((kind: WindowKind, projectId?: string) => {
    const id = `${kind}-${projectId ?? "root"}`;

    setWindows((current) => {
      const topZIndex = getTopZIndex(current);
      const existing = current.find((item) => item.id === id);

      if (existing) {
        return current.map((item) =>
          item.id === id
            ? { ...item, minimized: false, zIndex: topZIndex + 1 }
            : item,
        );
      }

      const newWindow: DesktopWindow = {
        id,
        kind,
        projectId,
        zIndex: topZIndex + 1,
        minimized: false,
      };

      return [...current, newWindow];
    });

    setMenuOpen(false);
    setSearchOpen(false);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen failed:", error);
    }
  };
  const closeWindow = useCallback((id: string) => {
    setWindows((current) => current.filter((item) => item.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((current) =>
      current.map((item) =>
        item.id === id && !item.minimized ? { ...item, minimized: true } : item,
      ),
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;

      const topZIndex = getTopZIndex(current);
      if (!target.minimized && target.zIndex === topZIndex) return current;

      return current.map((item) =>
        item.id === id
          ? { ...item, minimized: false, zIndex: topZIndex + 1 }
          : item,
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

  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return APPLICATIONS.filter((app) =>
      app.label.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="desktop-in relative h-dvh w-full select-none overflow-hidden bg-[#050913] text-cyan-50">
      {/* Imported asset URLs are handled by Vite for development and production builds. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${dragonWallpaper})` }}
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
        <header className="relative z-40 flex h-11 shrink-0 items-center gap-2 border-b border-cyan-300/15 bg-[#050913]/75 px-2 backdrop-blur-xl sm:gap-3 sm:px-5">
          {/* Application menu and profile */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle application menu"
            className="group inline-flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 sm:px-2"
          >
            <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
              <img
                src={profilePhoto}
                alt="Oussama profile photo"
                width={28}
                height={28}
                className="size-full rounded-md object-cover object-center"
              />
            </span>

            <span className="hidden text-xs font-semibold tracking-wide text-slate-100 min-[380px]:inline">
              Oussama OS
            </span>
          </button>

          <span className="hidden h-4 w-px bg-cyan-200/20 sm:block" />

          <span className="hidden text-xs text-cyan-100/65 sm:block">
            Portfolio workspace
          </span>

          <span className="flex-1" />

          {/* System status and controls */}
          <div className="flex shrink-0 items-center gap-1 text-cyan-100/75 sm:gap-3">
            <span
              className="hidden items-center gap-1.5 sm:flex"
              title="Network status"
              aria-label="Network status"
            >
              <Wifi size={14} />
            </span>

            <span className="hidden sm:block" title="Audio status">
              <Volume2 size={14} />
            </span>

            <span className="hidden sm:block" title="Battery status">
              <Battery size={15} />
            </span>

            <button
              type="button"
              aria-label="Search applications"
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((open) => !open);
                setMenuOpen(false);
              }}
              className="rounded-md p-1.5 transition hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <Search size={15} />
            </button>

            {/* Clock and date */}
            <div className="min-w-[55px] text-right font-mono leading-tight sm:min-w-[74px]">
              <div className="text-xs font-semibold tabular-nums text-cyan-300">
                {clock}
              </div>

              <div className="mt-0.5 hidden text-[9px] text-slate-400 md:block">
                {date}
              </div>
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/5 text-cyan-300 transition-all duration-200 hover:border-cyan-300/50 hover:bg-cyan-300/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Session / power menu */}
            <button
              type="button"
              aria-label="Toggle session menu"
              aria-expanded={menuOpen}
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
              <p className="text-[10px] uppercase tracking-[.24em] text-cyan-300/60">
                Workspace
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                Oussama OS
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                oussama@linux:~
              </p>
            </div>
            <div className="p-2">
              {[
                {
                  label: "Terminal",
                  icon: TerminalIcon,
                  action: () => openWindow("terminal"),
                },
                {
                  label: "File manager",
                  icon: FolderOpen,
                  action: () => openWindow("files"),
                },
                {
                  label: "About this portfolio",
                  icon: Code2,
                  action: () => openWindow("about"),
                },
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
              <div className="mt-1 border-t border-cyan-200/10 pt-1">
                <a
                  href={profile.resumePath}
                  download={profile.resumeFileName}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Download CV as PDF"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100"
                >
                  <Download size={15} className="text-cyan-300" />
                  Download CV (PDF)
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Application search */}
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
              {filteredApps.length ? (
                filteredApps.map((app) => {
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
                })
              ) : (
                <p className="px-3 py-4 text-xs text-slate-500">
                  No matching applications.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Desktop workspace */}
        <main
          className="relative flex min-h-0 flex-1 overflow-hidden"
          onPointerDown={(event) => {
            if (event.currentTarget === event.target) {
              setSelectedIcon(null);
            }
          }}
        >
          <nav
            aria-label="Desktop shortcuts"
            className="pointer-events-none absolute inset-0 z-0 p-2 sm:p-3"
          >
            <ul className="desktop-icon-grid h-full max-h-full">
              <li className="pointer-events-auto">
                <DesktopIcon
                  label="Terminal"
                  icon={<TerminalIcon size={26} />}
                  selected={selectedIcon === "terminal"}
                  onSelect={() => setSelectedIcon("terminal")}
                  onOpen={() => openWindow("terminal")}
                />
              </li>
              <li className="pointer-events-auto">
                <DesktopIcon
                  label="Files"
                  icon={<FolderOpen size={26} />}
                  selected={selectedIcon === "files"}
                  onSelect={() => setSelectedIcon("files")}
                  onOpen={() => openWindow("files")}
                />
              </li>
              <li className="pointer-events-auto">
                <DesktopIcon
                  label="Resume"
                  icon={<FileText size={26} />}
                  selected={selectedIcon === "resume"}
                  onSelect={() => setSelectedIcon("resume")}
                  onOpen={() => openWindow("about")}
                />
              </li>
              {projects.map((project) => (
                <li key={project.id} className="pointer-events-auto">
                  <DesktopIcon
                    label={project.name}
                    icon={
                      <Folder
                        size={26}
                        style={{ color: project.accent || "#38bdf8" }}
                      />
                    }
                    selected={selectedIcon === project.id}
                    onSelect={() => setSelectedIcon(project.id)}
                    onOpen={() => openWindow("files", project.id)}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Right-side system monitor */}
          <aside
            className="absolute right-4 top-5 z-10 hidden w-48 border-l border-cyan-300/35 pl-4 text-slate-200/90 xl:block 2xl:right-7 2xl:top-8 2xl:w-52"
            aria-label="Decorative system status"
          >
            <div className="font-mono text-4xl font-light tracking-wider text-cyan-300">
              {clock}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">{date}</p>
            <div className="my-4 h-px bg-cyan-300/45" />
            <p className="text-xs leading-relaxed text-slate-300">
              Code today,
              <br />
              build tomorrow.
            </p>
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
              <span className="font-mono text-cyan-100">
                {projects.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Session</span>
              <span className="font-mono text-emerald-300">ACTIVE</span>
            </div>
          </aside>

          {!isCoarsePointer && (
            <div className="absolute bottom-5 right-4 z-10 hidden items-center gap-2 rounded-lg border border-cyan-200/15 bg-[#06101b]/45 px-3 py-2 font-mono text-[9px] text-slate-300/70 backdrop-blur-md md:flex xl:right-60">
              <LayoutGrid size={12} className="text-cyan-300/80" />
              click an icon to open
            </div>
          )}

          {/* Interactive application windows */}
          {windows.map((item) => {
            if (item.kind === "terminal") {
              return (
                <TerminalApp
                  key={item.id}
                  hidden={item.minimized}
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
                  hidden={item.minimized}
                  onClose={() => closeWindow(item.id)}
                  onMinimize={() => minimizeWindow(item.id)}
                  initialPosition={{ x: 260, y: 130 }}
                  initialSize={{ width: 460, height: 390 }}
                >
                  <div className="h-full overflow-y-auto p-4 text-sm text-cyan-50/85 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_12px_rgba(34,211,238,0.12)]">
                        <img
                          src={profilePhoto}
                          alt="Oussama profile photo"
                          width={48}
                          height={48}
                          className="size-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h2 className="font-mono text-xl tracking-widest text-cyan-100">
                          OUSSAMA
                        </h2>
                        <p className="mt-1 font-mono text-[10px] tracking-[.2em] text-cyan-300/60">
                          {profile.role}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {aboutInfo.education}
                        </p>
                      </div>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      Welcome to my Linux-inspired portfolio workspace. Explore
                      the projects, open the terminal, or browse the file
                      manager to discover my work and development setup.
                    </p>
                    <p className="mt-3 leading-relaxed text-slate-300">
                      {aboutInfo.tagline}
                    </p>
                    <a
                      href={profile.resumePath}
                      download={profile.resumeFileName}
                      aria-label="Download CV as PDF"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-gradient-to-r from-cyan-400/15 to-teal-400/10 px-4 py-2.5 font-mono text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:border-cyan-300/70 hover:bg-cyan-300/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                    >
                      <Download size={16} className="text-cyan-300" />
                      Download CV (PDF)
                    </a>
                    <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
                      {profile.resumeFileName} · {profile.resumePath}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.04] p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">
                          Projects
                        </p>
                        <p className="mt-1 font-mono text-xl text-cyan-200">
                          {projects.length.toString().padStart(2, "0")}
                        </p>
                      </div>
                      <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.04] p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500">
                          Environment
                        </p>
                        <p className="mt-1 font-mono text-sm text-cyan-200">
                          React + Linux
                        </p>
                      </div>
                    </div>
                    <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.24em] text-slate-400">
                      Tech stack
                    </h3>
                    <div className="mt-3 space-y-3">
                      {aboutInfo.techStack.map((group) => (
                        <div key={group.label}>
                          <p className="font-mono text-[11px] text-cyan-300/80">
                            {group.label}
                          </p>
                          <ul className="mt-1.5 flex flex-wrap gap-1.5">
                            {group.items.map((item) => (
                              <li
                                key={item}
                                className="rounded-full border border-cyan-300/15 bg-cyan-300/[.05] px-2 py-0.5 font-mono text-[10px] text-cyan-100/80"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.24em] text-slate-400">
                      Instructor &amp; teaching
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {instructorExperience.map((role) => (
                        <li
                          key={role.org}
                          className="rounded-lg border border-cyan-300/15 bg-cyan-300/[.04] p-3"
                        >
                          <p className="font-mono text-xs text-cyan-100">{role.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {role.org} · {role.period}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {role.points.map((point) => (
                              <li
                                key={point}
                                className="flex gap-1.5 text-[11px] leading-snug text-cyan-100/70"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-px shrink-0 text-cyan-300/80"
                                >
                                  ▸
                                </span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.24em] text-slate-400">
                      Contribution universe
                    </h3>
                    <div className="mt-3">
                      <ContributionUniverse />
                      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                        Live commit activity from my public GitHub — the grid
                        updates as I ship.
                      </p>
                    </div>
                    <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.24em] text-slate-400">
                      Find me online
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {PROFILE_LINKS.map((link) => {
                        if (link.label === "Email") {
                          return (
                            <li key={link.label}>
                              <CopyEmailLink />
                            </li>
                          );
                        }
                        const Icon = link.icon;
                        return (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              download={
                                "download" in link ? link.download : undefined
                              }
                              target={
                                link.label === "Resume" ? undefined : "_blank"
                              }
                              rel={
                                link.label === "Resume" ? undefined : "noreferrer"
                              }
                              className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 transition hover:text-white"
                            >
                              <Icon size={13} /> {link.label}{" "}
                              <span aria-hidden="true">↗</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </WindowFrame>
              );
            }

            return (
              <FileManager
                key={item.id}
                zIndex={item.zIndex}
                hidden={item.minimized}
                initialProjectId={item.projectId}
                onClose={() => closeWindow(item.id)}
                onMinimize={() => minimizeWindow(item.id)}
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
              {
                label: "Terminal",
                icon: TerminalIcon,
                action: () => openWindow("terminal"),
              },
              {
                label: "Files",
                icon: FolderOpen,
                action: () => openWindow("files"),
              },
              {
                label: "Projects",
                icon: Code2,
                action: () => openWindow("files"),
              },
              {
                label: "About",
                icon: Globe,
                action: () => openWindow("about"),
              },
              {
                label: "Applications",
                icon: LayoutGrid,
                action: () => setMenuOpen((open) => !open),
              },
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

        {/* Restore minimized windows from the taskbar area. */}
        {windows.some((item) => item.minimized) && (
          <div className="absolute bottom-14 left-1/2 z-[65] flex max-w-[calc(100vw-24px)] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl border border-cyan-200/15 bg-[#07111d]/90 p-2 shadow-2xl backdrop-blur-xl">
            {windows
              .filter((item) => item.minimized)
              .map((item) => (
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
