import { useCallback, useEffect, useRef, useState } from "react";
import dragonWallpaper from "../assets/Neon Dragon Linux Tech Wallpaper.png";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import "../LogoSplash.css";

type LogoSplashProps = {
  onDone: () => void;
  durationMs?: number;
  blendBlack?: boolean;
};

const BOOT_LOGS = [
  {
    at: 0.02,
    time: "0.182",
    message: "Linux version 6.x.0-oussama (portfolio kernel)",
    kind: "kernel",
  },
  {
    at: 0.08,
    time: "0.416",
    message: "Command line: quiet splash loglevel=3",
    kind: "kernel",
  },
  {
    at: 0.15,
    time: "0.892",
    message: "Mounting virtual filesystems",
    kind: "service",
  },
  {
    at: 0.23,
    time: "1.124",
    message: "Reached target Local File Systems",
    kind: "ok",
  },
  {
    at: 0.32,
    time: "1.582",
    message: "Starting Network Manager",
    kind: "service",
  },
  { at: 0.4, time: "1.903", message: "Started Network Manager", kind: "ok" },
  { at: 0.49, time: "2.147", message: "Reached target Network", kind: "ok" },
  {
    at: 0.58,
    time: "2.406",
    message: "Starting User Login Management",
    kind: "service",
  },
  {
    at: 0.67,
    time: "2.781",
    message: "Started User Login Management",
    kind: "ok",
  },
  {
    at: 0.76,
    time: "3.102",
    message: "Starting Display Manager",
    kind: "service",
  },
  {
    at: 0.86,
    time: "3.448",
    message: "Reached target Graphical Interface",
    kind: "ok",
  },
  {
    at: 0.94,
    time: "3.721",
    message: "oussama-session.service: Started",
    kind: "ok",
  },
] as const;

const PHASES = [
  { at: 0, label: "Initializing kernel" },
  { at: 0.16, label: "Mounting file systems" },
  { at: 0.32, label: "Bringing network online" },
  { at: 0.52, label: "Starting system services" },
  { at: 0.75, label: "Launching graphical session" },
  { at: 0.94, label: "Welcome back, Oussama" },
] as const;

const EXIT_MS = 550;
const REDUCED_MOTION_MS = 350;

function smoothProgress(t: number) {
  const stops = [
    [0, 0],
    [0.12, 0.09],
    [0.3, 0.28],
    [0.43, 0.35],
    [0.65, 0.68],
    [0.79, 0.76],
    [0.92, 0.94],
    [1, 1],
  ];

  for (let i = 1; i < stops.length; i++) {
    const [t1, p1] = stops[i];
    if (t <= t1) {
      const [t0, p0] = stops[i - 1];
      const k = Math.max(0, (t - t0) / (t1 - t0));
      const eased = k * k * (3 - 2 * k);
      return p0 + (p1 - p0) * eased;
    }
  }

  return 1;
}

export default function LogoSplash({
  onDone,
  durationMs = 3800,
  blendBlack = true,
}: LogoSplashProps) {
  const reducedMotion = usePrefersReducedMotion();

  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState(0);

  const fillRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    cancelAnimationFrame(rafRef.current);
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    setProgress(100);
    setVisibleLogs(BOOT_LOGS.length);
    setComplete(true);

    if (fillRef.current) {
      fillRef.current.style.transform = "scaleX(1)";
    }

    if (reducedMotion) {
      onDoneRef.current();
      return;
    }

    setExiting(true);

    timersRef.current.push(
      window.setTimeout(() => onDoneRef.current(), EXIT_MS),
    );
  }, [reducedMotion]);

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  useEffect(() => {
    finishedRef.current = false;

    /* Re-apply the initial state asynchronously so the effect body itself
       stays synchronous (react-hooks/set-state-in-effect). */
    queueMicrotask(() => {
      setProgress(0);
      setVisibleLogs(0);
      setExiting(false);
      setComplete(false);
    });

    const timers: number[] = [];
    timersRef.current = timers;

    if (reducedMotion) {
      queueMicrotask(() => {
        setProgress(100);
        setVisibleLogs(BOOT_LOGS.length);
        setComplete(true);
      });

      if (fillRef.current) {
        fillRef.current.style.transform = "scaleX(1)";
      }

      timers.push(
        window.setTimeout(() => {
          if (finishedRef.current) return;
          finishedRef.current = true;
          onDoneRef.current();
        }, REDUCED_MOTION_MS),
      );

      return () => {
        timers.forEach(window.clearTimeout);
      };
    }

    BOOT_LOGS.forEach((log, index) => {
      timers.push(
        window.setTimeout(
          () => {
            if (!finishedRef.current) setVisibleLogs(index + 1);
          },
          250 + log.at * durationMs,
        ),
      );
    });

    const startAt = performance.now() + 400;
    let lastPercent = -1;

    const tick = (now: number) => {
      if (finishedRef.current) return;

      const t = Math.min(1, Math.max(0, (now - startAt) / durationMs));
      const value = smoothProgress(t);
      const percent = Math.round(value * 100);

      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${value})`;
      }

      if (percent !== lastPercent) {
        lastPercent = percent;
        setProgress(percent);
      }

      if (t >= 1) {
        timers.push(window.setTimeout(() => finishRef.current(), 320));
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      timers.forEach(window.clearTimeout);
    };
  }, [durationMs, reducedMotion]);

  useEffect(() => {
    const skip = (event: KeyboardEvent | PointerEvent) => {
      if (
        event instanceof KeyboardEvent &&
        (event.metaKey || event.ctrlKey || event.altKey)
      ) {
        return;
      }

      finishRef.current();
    };

    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  const status =
    [...PHASES].reverse().find((phase) => progress / 100 >= phase.at)?.label ??
    PHASES[0].label;

  return (
    <main
      className={`lsplash-root ${exiting ? "lsplash-exit" : ""}`}
      style={{ "--exit-ms": `${EXIT_MS}ms` } as React.CSSProperties}
      aria-label="Oussama Linux startup screen"
      aria-busy={!complete}
    >
      <div className="lsplash-vignette" aria-hidden="true" />
      <div className="lsplash-grain" aria-hidden="true" />

      <header className="lsplash-topbar">
        <span className="lsplash-brand">
          <span className="lsplash-brand-dot" />
          OUSSAMA OS
        </span>
        <span className="lsplash-edition">PORTFOLIO EDITION</span>
      </header>

      <section className="lsplash-kernel" aria-live="off">
        {BOOT_LOGS.slice(0, visibleLogs).map((log) => (
          <p key={log.time} className={`lsplash-kline ${log.kind}`}>
            <span className="lsplash-log-time">[{log.time}]</span>
            <span>{log.message}</span>
          </p>
        ))}
      </section>

      <section className="lsplash-center">
        <div className="lsplash-logo-box">
          <div className="lsplash-glow" aria-hidden="true" />
          <div className="lsplash-orbit" aria-hidden="true" />

          <img
            src={dragonWallpaper}
            alt="Oussama's dragon developer emblem"
            draggable={false}
            className={`lsplash-logo ${blendBlack ? "lsplash-blend" : ""}`}
          />

          <div
            className="lsplash-sweep"
            style={{
              WebkitMaskImage: `url("${dragonWallpaper}")`,
              maskImage: `url("${dragonWallpaper}")`,
            }}
            aria-hidden="true"
          />
        </div>

        <div className="lsplash-identity">
          <p className="lsplash-name">
            OUSSAMA<span>.</span>
          </p>
          <p className="lsplash-role">FULL STACK DEVELOPER</p>
          <div className="lsplash-divider">
            <span />
            <code>BUILD · SHIP · REPEAT</code>
            <span />
          </div>
        </div>

        <div className="lsplash-progress">
          <div className="lsplash-progress-heading">
            <span className="lsplash-status">
              <span className="lsplash-status-dot" />
              {complete ? "Session ready" : status}
            </span>
            <span className="lsplash-percent">
              {String(progress).padStart(3, "0")}%
            </span>
          </div>

          <div
            className="lsplash-track"
            role="progressbar"
            aria-label="Simulated startup progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div ref={fillRef} className="lsplash-fill" />
          </div>

          <div className="lsplash-progress-footer">
            <span>oussama@linux:~$</span>
            <span>{complete ? "READY" : "BOOTING SYSTEM"}</span>
          </div>
        </div>
      </section>

      <footer className="lsplash-footer">
        <span>LINUX-INSPIRED STARTUP</span>
        <span className="lsplash-skip">
          PRESS ANY KEY TO SKIP <span>↗</span>
        </span>
      </footer>
    </main>
  );
}
