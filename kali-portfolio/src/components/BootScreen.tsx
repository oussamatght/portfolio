import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

type BootScreenProps = {
  onComplete: () => void
  /** Scales every stage of the sequence. 1 = default (~6.4s). */
  durationScale?: number
}

type Stage = 'firmware' | 'grub' | 'messages' | 'ready'
type LineKind = 'kernel' | 'start' | 'ok' | 'target'

/** Tunable timings, in milliseconds, for each stage of the simulated boot. */
const TIMING = {
  firmwareMs: 900,
  grubMs: 1500,
  messageIntervalMs: 170,
  settleMs: 950,
  fadeMs: 400,
}

const GRUB_ENTRIES = [
  'Kali GNU/Linux Rolling 2026.1',
  'Advanced options for Kali GNU/Linux Rolling 2026.1',
  'Memory test (memtest86+)',
]

const GRUB_INNER = 66
const GRUB_INNER_MOBILE = 32

const MESSAGE_LINES: { kind: LineKind; text: string }[] = [
  { kind: 'kernel', text: '[    0.000000] Linux version 6.12.0-kali5-amd64' },
  {
    kind: 'kernel',
    text: '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.12.0-kali5-amd64 root=/dev/sda1 ro quiet',
  },
  { kind: 'kernel', text: '[    0.240000] systemd[1]: systemd 257 running in system mode' },
  { kind: 'kernel', text: '[    0.410000] systemd[1]: Detected system architecture x86-64' },
  { kind: 'ok', text: '[  OK  ] Reached target Local File Systems.' },
  { kind: 'ok', text: '[  OK  ] Mounted /home.' },
  { kind: 'ok', text: '[  OK  ] Started Journal Service.' },
  { kind: 'start', text: '     Starting udev Kernel Device Manager...' },
  { kind: 'ok', text: '[  OK  ] Started udev Kernel Device Manager.' },
  { kind: 'start', text: '     Starting Network Manager...' },
  { kind: 'ok', text: '[  OK  ] Started Network Manager.' },
  { kind: 'start', text: '     Starting Kali Portfolio Workspace...' },
  { kind: 'ok', text: '[  OK  ] Started Kali Portfolio Workspace.' },
  { kind: 'start', text: '     Starting Display Manager...' },
  { kind: 'ok', text: '[  OK  ] Started Display Manager.' },
  { kind: 'target', text: '[  OK  ] Reached target Graphical Interface.' },
]

const LINE_CLASS: Record<LineKind, string> = {
  kernel: 'text-neutral-600',
  start: 'text-neutral-500',
  ok: 'text-neutral-400',
  target: 'text-blue-300/90',
}

const INTERACTIVE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'OPTION']
const IGNORED_KEYS = ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock']

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function usePrefersReducedMotion() {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const getSnapshot = useCallback(() => window.matchMedia(REDUCED_MOTION_QUERY).matches, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export default function BootScreen({ onComplete, durationScale = 1 }: BootScreenProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [stage, setStage] = useState<Stage>('firmware')
  const [grubIndex, setGrubIndex] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [fading, setFading] = useState(false)

  const finishedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const scale = durationScale > 0 ? durationScale : 1
  const fadeMs = reducedMotion ? 0 : TIMING.fadeMs * scale

  const complete = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
    onComplete()
  }, [onComplete])

  const skip = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
    setFading(true)
    if (fadeMs === 0) {
      complete()
      return
    }
    timersRef.current.push(window.setTimeout(complete, fadeMs))
  }, [complete, fadeMs])

  useEffect(() => {
    const timers: number[] = []
    let clock = 0

    const at = (delay: number, run: () => void) => {
      const id = window.setTimeout(() => {
        if (finishedRef.current) return
        run()
      }, delay)
      timers.push(id)
    }

    const scaled = (ms: number) => Math.round(ms * scale)

    clock = scaled(TIMING.firmwareMs)
    at(clock, () => setStage('grub'))

    clock += scaled(TIMING.grubMs)
    at(clock, () => setStage('messages'))

    MESSAGE_LINES.forEach((_, index) => {
      clock += scaled(TIMING.messageIntervalMs)
      at(clock, () => setLineCount(index + 1))
    })

    clock += scaled(TIMING.settleMs)
    at(clock, () => setStage('ready'))

    clock += fadeMs
    at(clock, () => {
      finishedRef.current = true
      onComplete()
    })

    timersRef.current = timers
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }
  }, [scale, fadeMs, onComplete])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED_KEYS.includes(event.key)) return

      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.isContentEditable || INTERACTIVE_TAGS.includes(target.tagName))
      ) {
        return
      }

      if (stage === 'grub' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault()
        setGrubIndex((index) => {
          const next = index + (event.key === 'ArrowDown' ? 1 : -1)
          return Math.min(Math.max(next, 0), GRUB_ENTRIES.length - 1)
        })
        return
      }

      if (stage === 'grub' && event.key === 'Enter') {
        event.preventDefault()
        skip()
        return
      }

      skip()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, skip])

  const grubBox = (inner: number) => (
    <div className="whitespace-pre">
      <div className="text-neutral-600">{'┌' + '─'.repeat(inner) + '┐'}</div>
      {GRUB_ENTRIES.map((entry, index) => (
        <div
          key={entry}
          className={
            index === grubIndex
              ? 'bg-neutral-200 text-neutral-900'
              : 'text-neutral-500'
          }
        >
          {'│' + ' ' + entry.padEnd(inner - 2) + ' ' + '│'}
        </div>
      ))}
      <div className="text-neutral-600">{'└' + '─'.repeat(inner) + '┘'}</div>
    </div>
  )

  return (
    <div
      className={`boot-console fixed inset-0 z-50 overflow-hidden bg-black ${
        fading && !reducedMotion ? 'boot-fade-out' : ''
      }`}
    >
      <div className="flex h-full w-full flex-col px-3 py-3 font-mono text-[11px] leading-[1.5] text-neutral-300 sm:px-6 sm:text-[13px]">
        {stage === 'firmware' && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-[11px] tracking-[0.55em] text-neutral-500">KALI LINUX</p>
              <p className="mt-2 text-[10px] text-neutral-700">kali-portfolio-os</p>
            </div>
          </div>
        )}

        {stage === 'grub' && (
          <div className="flex-1">
            <p className="text-neutral-500"> GNU GRUB  version 2.06-13</p>
            <p>&nbsp;</p>
            <div className="sm:hidden">{grubBox(GRUB_INNER_MOBILE)}</div>
            <div className="hidden sm:block">{grubBox(GRUB_INNER)}</div>
            <p>&nbsp;</p>
            <p className="text-neutral-600">
              Use the UP and DOWN keys to select which entry is highlighted.
            </p>
            <p className="text-neutral-600">
              Press enter to boot the selected OS, or any other key to skip.
            </p>
          </div>
        )}

        {(stage === 'messages' || stage === 'ready') && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="terminal-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words">
              {MESSAGE_LINES.slice(0, lineCount).map((line, index) => (
                <div key={index} className={LINE_CLASS[line.kind]}>
                  {line.text}
                </div>
              ))}
            </div>
            {stage === 'ready' && (
              <p className="mt-3 shrink-0 text-neutral-500">
                kali-portfolio-os login: <span className="text-neutral-300">kali</span>
                {!reducedMotion && <span className="boot-cursor" />}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="pointer-events-none absolute bottom-2 left-3 font-mono text-[10px] text-neutral-800 sm:left-6">
        simulated boot sequence for a browser portfolio &mdash; no real kernel is started
      </p>
    </div>
  )
}
