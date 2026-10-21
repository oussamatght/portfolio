import { useCallback, useEffect, useRef, useState } from 'react'
import dragonLogo from '../assets/Neon Dragon Linux Tech Wallpaper.png'

type BootScreenProps = {
  onComplete: () => void
}

const BOOT_LINES = [
  'Kali GNU/Linux Rolling 2026.1 tty1',
  'Loading Linux kernel 6.12.0-kali5-amd64 ...',
  'Mounting /dev/sda1 on / ...',
  'Starting udev kernel device manager ...',
  'Loading initial ramdisk ...',
  'Starting systemd-journald.service ...',
  'Starting NetworkManager.service ...',
  'Starting display-manager.service ...',
  'Mounting /home/kali/projects ...',
  'Starting kali-portfolio-os ...',
]

const BOOT_DURATION = 3400
const EXIT_DURATION = 620

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setExiting(true)
    window.setTimeout(() => onComplete(), EXIT_DURATION)
  }, [onComplete])

  useEffect(() => {
    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / BOOT_DURATION, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setProgress(Math.round(eased * 100))
      if (elapsed < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        finish()
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [finish])

  useEffect(() => {
    const skip = (event: KeyboardEvent) => {
      if (event.key === 'Tab') return
      finish()
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [finish])

  const visibleLines = BOOT_LINES.slice(
    0,
    Math.max(1, Math.ceil((progress / 100) * BOOT_LINES.length)),
  )
  const current = visibleLines[visibleLines.length - 1]

  return (
    <div
      onClick={finish}
      className={`boot-root fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black ${
        exiting ? 'boot-exit' : ''
      }`}
    >
      <div
        className="boot-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${dragonLogo})` }}
      />
      <div className="boot-scan absolute inset-0" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6">
        <div className="boot-logo relative">
          <div className="neon-ring absolute -inset-3 rounded-3xl" />
          <img
            src={dragonLogo}
            alt="Kali Portfolio OS"
            className="relative h-auto w-[min(78vw,520px)] rounded-2xl border border-cyan-400/40 object-cover shadow-[0_0_60px_rgba(34,211,238,0.25)]"
          />
        </div>

        <div className="mt-7 text-center">
          <h1 className="text-2xl font-semibold tracking-[0.55em] text-cyan-200 sm:text-3xl">
            KALI<span className="text-teal-300">·</span>PORTFOLIO
          </h1>
          <p className="mt-2 font-mono text-xs text-cyan-300/60">
            Kali GNU/Linux Rolling 2026.1 &mdash; portfolio edition
          </p>
        </div>

        <div className="mt-8 w-full">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="System boot progress"
            className="h-[3px] w-full overflow-hidden rounded-full bg-cyan-400/15"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 shadow-[0_0_14px_rgba(34,211,238,0.85)] transition-[width] duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-cyan-300/70">
            <span className="truncate pr-4">{current}</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
        </div>

        <p className="mt-10 font-mono text-[11px] text-cyan-300/40">
          <span className="blink">press any key to skip</span>
        </p>
      </div>
    </div>
  )
}
