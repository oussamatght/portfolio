import { useCallback, useEffect, useRef, useState } from 'react'

type LinuxBootLogProps = {
  /** Fired after the whole log has printed and settled. */
  onDone: () => void
  /** Escape returns to the main GRUB menu. */
  onEscape: () => void
}

type LineKind = 'info' | 'start' | 'ok' | 'target'

const LINES: { kind: LineKind; text: string }[] = [
  { kind: 'info', text: "Booting `Kali GNU/Linux Rolling 2026.1' from partition /dev/sda1" },
  { kind: 'info', text: 'Loading Linux kernel 6.12.0-kali5-amd64 ...' },
  { kind: 'info', text: 'Loading initial ramdisk ...' },
  { kind: 'info', text: 'Starting system initialization ...' },
  { kind: 'start', text: '     Starting udev Kernel Device Manager...' },
  { kind: 'ok', text: '[  OK  ] Started udev Kernel Device Manager.' },
  { kind: 'start', text: '     Starting network services...' },
  { kind: 'ok', text: '[  OK  ] Started Network Manager.' },
  { kind: 'ok', text: '[  OK  ] Started network services.' },
  { kind: 'start', text: '     Starting Kali Portfolio Workspace...' },
  { kind: 'ok', text: '[  OK  ] Started Kali Portfolio Workspace.' },
  { kind: 'start', text: '     Starting graphical session...' },
  { kind: 'ok', text: '[  OK  ] Started Display Manager.' },
  { kind: 'target', text: '[  OK  ] Reached target Graphical Interface.' },
]

const LINE_CLASS: Record<LineKind, string> = {
  info: 'text-neutral-400',
  start: 'text-neutral-500',
  ok: 'text-neutral-300',
  target: 'text-blue-300/90',
}

const INTERVAL_MS = 170
const SETTLE_MS = 900

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

export default function LinuxBootLog({ onDone, onEscape }: LinuxBootLogProps) {
  const [lineCount, setLineCount] = useState(0)
  const [settled, setSettled] = useState(false)
  const timersRef = useRef<number[]>([])
  const finishedRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])
  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  const stopTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopTimers()
    onDoneRef.current()
  }, [stopTimers])

  const skip = useCallback(() => {
    if (finishedRef.current || settled) return
    stopTimers()
    setLineCount(LINES.length)
    setSettled(true)
    timersRef.current.push(window.setTimeout(finish, 250))
  }, [finish, settled, stopTimers])

  useEffect(() => {
    let clock = 0
    LINES.forEach((_, index) => {
      clock += INTERVAL_MS
      timersRef.current.push(
        window.setTimeout(() => setLineCount(index + 1), clock),
      )
    })
    clock += SETTLE_MS
    timersRef.current.push(
      window.setTimeout(() => {
        setSettled(true)
      }, clock),
    )
    timersRef.current.push(
      window.setTimeout(() => {
        finishedRef.current = true
        onDoneRef.current()
      }, clock + 500),
    )
    return stopTimers
  }, [stopTimers])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED_KEYS.includes(event.key)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        finishedRef.current = true
        stopTimers()
        onEscapeRef.current()
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        skip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [skip, stopTimers])

  const progress =
    Math.round((Math.min(lineCount, LINES.length) / LINES.length) * 100) || 0

  return (
    <div className="stage-in flex h-full w-full flex-col px-3 py-3 sm:px-6 sm:py-5">
      <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words">
        {LINES.slice(0, lineCount).map((line, index) => (
          <div key={index} className={LINE_CLASS[line.kind]}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex shrink-0 items-center gap-3">
        <div className="h-1 w-40 overflow-hidden rounded-full bg-neutral-800 sm:w-56">
          <div
            className="h-full rounded-full bg-blue-500/80 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-neutral-500">
          {progress}%
        </span>
        <span className="font-mono text-[10px] text-neutral-500">
          {settled
            ? 'press Enter to continue'
            : 'press Enter to skip · Escape to return to GRUB'}
        </span>
      </div>
    </div>
  )
}
