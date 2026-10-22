import { useCallback, useEffect, useRef, useState } from 'react'

type RecoveryConsoleProps = {
  /** Enter or button: continue the normal boot into the portfolio. */
  onContinue: () => void
  /** Escape or button: return to the main GRUB menu. */
  onReturn: () => void
}

const LINES = [
  "Booting `Kali GNU/Linux Rolling 2026.1 (recovery mode)' from partition /dev/sda1",
  '[   12.113000] systemd[1]: Recovery mode engaged — minimal service set',
  '[   12.288000] systemd[1]: Starting Journal Service...',
  '[  OK  ] Started Journal Service.',
  '[   12.401000] systemd-fsckd[451]: Checking filesystem integrity on /dev/sda1 ...',
  'fsck 1.47.2 (kali-2026.1): /dev/sda1: clean, 3121/1562500 files, 148422/15625000 blocks',
  '[  OK  ] Filesystem integrity verified — no errors found',
  '[  OK  ] Journal replay completed — last 3 boots recovered',
  '[  OK  ] Hardware sweep complete — no faults detected',
  'Diagnostics complete. This system is healthy.',
]

const INTERVAL_MS = 420

const IGNORED_KEYS = [
  'Tab',
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'NumLock',
  'ScrollLock',
]

export default function RecoveryConsole({
  onContinue,
  onReturn,
}: RecoveryConsoleProps) {
  const [lineCount, setLineCount] = useState(0)
  const timersRef = useRef<number[]>([])
  const finishedRef = useRef(false)
  const onContinueRef = useRef(onContinue)
  const onReturnRef = useRef(onReturn)

  useEffect(() => {
    onContinueRef.current = onContinue
  }, [onContinue])
  useEffect(() => {
    onReturnRef.current = onReturn
  }, [onReturn])

  const stopTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => {
    let clock = 0
    LINES.forEach((_, index) => {
      clock += INTERVAL_MS
      timersRef.current.push(
        window.setTimeout(() => setLineCount(index + 1), clock),
      )
    })
    timersRef.current.push(
      window.setTimeout(() => setLineCount(LINES.length), clock),
    )
    return stopTimers
  }, [stopTimers])

  const ready = lineCount >= LINES.length

  useEffect(() => {
    if (!ready || finishedRef.current) return
    finishedRef.current = true
    stopTimers()
  }, [ready, stopTimers])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED_KEYS.includes(event.key)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        stopTimers()
        finishedRef.current = true
        onReturnRef.current()
        return
      }
      if (event.key === 'Enter' && ready) {
        event.preventDefault()
        stopTimers()
        finishedRef.current = true
        onContinueRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, stopTimers])

  return (
    <div className="stage-in flex h-full w-full flex-col overflow-y-auto px-4 py-5 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-neutral-200">
          Kali GNU/Linux Rolling 2026.1 — recovery mode
        </p>
        <p className="text-neutral-500">
          Minimal diagnostic shell (visual simulation)
        </p>
        <p className="h-4" />
        <div className="whitespace-pre-wrap break-words text-[11px] sm:text-[13px]">
          {LINES.slice(0, lineCount).map((line, index) => (
            <p
              key={index}
              className={index === LINES.length - 1 ? 'text-blue-300/90' : 'text-neutral-400'}
            >
              {line}
            </p>
          ))}
        </div>

        {ready && (
          <div className="mt-6">
            <p className="text-[11px] text-neutral-500 sm:text-[13px]">
              Press Enter to continue to the portfolio, or Escape to return to
              GRUB.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  stopTimers()
                  finishedRef.current = true
                  onContinueRef.current()
                }}
                className="border border-blue-500/40 bg-blue-500/10 px-4 py-2 font-mono text-[11px] text-blue-200 transition hover:bg-blue-500/20 sm:text-[12px]"
              >
                Enter · continue to portfolio
              </button>
              <button
                type="button"
                onClick={() => {
                  stopTimers()
                  finishedRef.current = true
                  onReturnRef.current()
                }}
                className="border border-neutral-700 px-4 py-2 font-mono text-[11px] text-neutral-300 transition hover:bg-neutral-800 sm:text-[12px]"
              >
                Escape · return to GRUB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
