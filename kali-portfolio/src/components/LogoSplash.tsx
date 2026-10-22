import { useEffect, useRef, useState } from "react";
import dragonWallpaper from "../assets/Neon Dragon Linux Tech Wallpaper.png";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type LogoSplashProps = {
  /** Fired once the splash has finished and faded out. */
  onDone: () => void;
  /** Total time the progress bar takes, in ms. Default 3800. */
  durationMs?: number;
  /**
   * true  -> the PNG has a black background: blend it into the screen (default).
   * false -> the PNG is transparent: show it as-is.
   */
  blendBlack?: boolean;
};

const KERNEL_LINES = [
  '[    1.021000] plymouth: splash theme "kali" loaded',
  "[    1.104000] systemd[1]: Reached target Basic System.",
  "[    1.190000] systemd[1]: Starting Graphical Interface...",
];

/**
 * Progress curve [timeFraction, progress]. Real boots are uneven: fast start,
 * a couple of small stalls (disk / network), then a quick finish.
 */
const CURVE: [number, number][] = [
  [0, 0],
  [0.12, 0.14],
  [0.3, 0.36],
  [0.42, 0.4],
  [0.62, 0.74],
  [0.78, 0.82],
  [0.92, 0.97],
  [1, 1],
];

const STATUS: [number, string][] = [
  [0, "Starting system services"],
  [0.25, "Mounting file systems"],
  [0.5, "Loading portfolio workspace"],
  [0.75, "Starting display manager"],
  [0.92, "Welcome"],
];

const LOGO_REVEAL_MS = 900;
const END_HOLD_MS = 350;
const EXIT_MS = 650;
const REDUCED_TOTAL_MS = 900;

function curveAt(t: number): number {
  for (let i = 1; i < CURVE.length; i++) {
    const [t1, p1] = CURVE[i];
    if (t <= t1) {
      const [t0, p0] = CURVE[i - 1];
      const k = (t - t0) / (t1 - t0);
      const eased = k * k * (3 - 2 * k); // smoothstep between points
      return p0 + (p1 - p0) * eased;
    }
  }
  return 1;
}

function statusAt(t: number): string {
  let text = STATUS[0][1];
  for (const [at, label] of STATUS) if (t >= at) text = label;
  return text;
}

export default function LogoSplash({
  onDone,
  durationMs = 3800,
  blendBlack = true,
}: LogoSplashProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [kernelLines, setKernelLines] = useState(0);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState(STATUS[0][1]);
  const [exiting, setExiting] = useState(false);

  const fillRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    timersRef.current.forEach((id) => window.clearTimeout(id));
    setPercent(100);
    if (fillRef.current) fillRef.current.style.transform = "scaleX(1)";
    if (reducedMotion) {
      onDoneRef.current();
      return;
    }
    setExiting(true);
    timersRef.current = [
      window.setTimeout(() => onDoneRef.current(), EXIT_MS),
    ];
  };

  /* Kernel lines + progress loop */
  useEffect(() => {
    const timers: number[] = [];

    if (reducedMotion) {
      setKernelLines(KERNEL_LINES.length);
      setPercent(100);
      setStatus("Welcome");
      if (fillRef.current) fillRef.current.style.transform = "scaleX(1)";
      timers.push(window.setTimeout(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        onDoneRef.current();
      }, REDUCED_TOTAL_MS));
      timersRef.current = timers;
      return () => timers.forEach((id) => window.clearTimeout(id));
    }

    KERNEL_LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setKernelLines(i + 1), 160 + i * 230));
    });

    /* Progress starts after the logo has faded in. */
    const startAt = performance.now() + LOGO_REVEAL_MS * 0.6;
    let lastInt = -1;
    let lastStatus = "";

    const tick = (now: number) => {
      if (finishedRef.current) return;
      const t = Math.min(Math.max((now - startAt) / durationMs, 0), 1);
      const p = curveAt(t);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;

      const int = Math.round(p * 100);
      if (int !== lastInt) {
        lastInt = int;
        setPercent(int);
      }
      const label = statusAt(t);
      if (label !== lastStatus) {
        lastStatus = label;
        setStatus(label);
      }

      if (t >= 1) {
        timers.push(window.setTimeout(finish, END_HOLD_MS));
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    timersRef.current = timers;
    return () => {
      cancelAnimationFrame(rafRef.current);
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, durationMs]);

  /* Any key / click skips */
  useEffect(() => {
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey || e.altKey)) return;
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div
      className={`lsplash-root ${exiting ? "lsplash-exit" : ""}`}
      style={{ ["--exit-ms" as string]: `${EXIT_MS}ms` }}
    >
      {/* vignette + subtle grain */}
      <div className="lsplash-vignette" />
      <div className="lsplash-grain" />

      {/* kernel messages */}
      <div className="lsplash-kernel">
        {KERNEL_LINES.slice(0, kernelLines).map((line) => (
          <p key={line} className="lsplash-kline">
            {line}
          </p>
        ))}
      </div>

      {/* logo */}
      <div className="lsplash-center">
        <div className="lsplash-logo-box">
          <div className="lsplash-glow" />
          <div className="lsplash-floor" />

          <img
            src={dragonWallpaper}
            alt="Kali Linux dragon logo"
            draggable={false}
            className={`lsplash-logo ${blendBlack ? "lsplash-blend" : ""}`}
          />

          {/* one-time light sweep, masked to the logo's shape */}
          <div
            className="lsplash-sweep"
            style={{
              WebkitMaskImage: `url("${dragonWallpaper}")`,
              maskImage: `url("${dragonWallpaper}")`,
            }}
          />
        </div>

        {/* progress */}
        <div className="lsplash-progress">
          <div className="lsplash-track">
            <div ref={fillRef} className="lsplash-fill" />
          </div>
          <div className="lsplash-meta">
            <span className="lsplash-status">{status}</span>
            <span className="lsplash-percent">{String(percent).padStart(3, " ")}%</span>
          </div>
        </div>
      </div>

      <p className="lsplash-hint">press any key to skip</p>
    </div>
  );
}