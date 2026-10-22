import { useCallback, useEffect, useRef, useState } from 'react'

type GrubMenuProps = {
  entries: string[]
  onSelect: (index: number) => void
  /** Called when Escape is pressed and a back action exists (e.g. submenu). */
  onEscape?: () => void
  /** 0 disables the automatic countdown (used by the submenu). */
  countdownSeconds?: number
  header?: string
  helpLines?: string[]
  defaultIndex?: number
}

const BOX_INNER = 66
const BOX_INNER_MOBILE = 32

const DEFAULT_HELP = [
  'Use the ↑ and ↓ keys to select which entry is highlighted.',
  'Press Enter to boot the selected OS.',
]

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

export default function GrubMenu({
  entries,
  onSelect,
  onEscape,
  countdownSeconds = 0,
  header = 'GNU GRUB  version 2.06-13',
  helpLines = DEFAULT_HELP,
  defaultIndex = 0,
}: GrubMenuProps) {
  const [index, setIndex] = useState(defaultIndex)
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds)
  const [paused, setPaused] = useState(false)

  const active = countdownSeconds > 0

  /** Set once so cancelled countdowns can never fire the automatic boot later. */
  const autoBootFiredRef = useRef(false)
  const selectRef = useRef(onSelect)
  const escapeRef = useRef(onEscape)

  useEffect(() => {
    selectRef.current = onSelect
  }, [onSelect])
  useEffect(() => {
    escapeRef.current = onEscape
  }, [onEscape])

  const select = useCallback((selected: number) => {
    autoBootFiredRef.current = true
    selectRef.current(selected)
  }, [])

  /* Automatic boot driven by the countdown; ticks stop entirely when the
     component unmounts, when paused, or once a selection has been made. */
  useEffect(() => {
    if (!active || paused || autoBootFiredRef.current) return
    if (secondsLeft <= 0) {
      select(index)
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(id)
  }, [secondsLeft, paused, active, index, select])

  /* Selection change resets the countdown so the visitor keeps a fair chance. */
  const move = useCallback(
    (delta: number) => {
      setIndex((current) =>
        Math.min(Math.max(current + delta, 0), entries.length - 1),
      )
      if (active && !autoBootFiredRef.current) setSecondsLeft(countdownSeconds)
    },
    [entries.length, active, countdownSeconds],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED_KEYS.includes(event.key)) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          move(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          move(1)
          break
        case 'Enter':
          event.preventDefault()
          select(index)
          break
        case 'Escape':
          event.preventDefault()
          if (escapeRef.current) {
            escapeRef.current()
          } else if (active) {
            /* No back action defined: Escape pauses/cancels automatic boot. */
            setPaused((value) => !value)
          }
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move, select, index, active])

  const renderBox = (inner: number) => (
    <div className="whitespace-pre">
      <div className="text-neutral-500">{'┌' + '─'.repeat(inner) + '┐'}</div>
      {entries.map((entry, entryIndex) => {
        const label =
          entry.length > inner - 4 ? `${entry.slice(0, inner - 5)}…` : entry
        return (
          <button
            key={entry}
            type="button"
            aria-label={entry}
            aria-selected={entryIndex === index}
            role="menuitem"
            onClick={() => select(entryIndex)}
            className={`block w-full text-left font-mono ${
              entryIndex === index
                ? 'bg-blue-800/80 text-white'
                : 'text-neutral-300'
            }`}
          >
            {'│  ' + label.padEnd(inner - 4) + '  │'}
          </button>
        )
      })}
      <div className="text-neutral-500">{'└' + '─'.repeat(inner) + '┘'}</div>
    </div>
  )

  return (
    <div
      className="stage-in flex h-full w-full justify-center overflow-y-auto px-3 py-6 sm:py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full max-w-2xl">
        <p className="text-neutral-400">{header}</p>
        <p className="h-4" />
        <div className="sm:hidden">{renderBox(BOX_INNER_MOBILE)}</div>
        <div className="hidden sm:block">{renderBox(BOX_INNER)}</div>
        <p className="h-4" />
        {helpLines.map((line) => (
          <p key={line} className="text-neutral-500">
            {line}
          </p>
        ))}
        {active && secondsLeft > 0 && !paused && (
          <p className="mt-2 text-neutral-300">
            The highlighted entry will be executed automatically in{' '}
            <span className="tabular-nums">{secondsLeft}</span> second
            {secondsLeft === 1 ? '' : 's'}.
          </p>
        )}
        {active && paused && secondsLeft > 0 && (
          <p className="mt-2 text-neutral-300">
            Automatic boot paused — press Escape to resume, or Enter to boot now.
          </p>
        )}
      </div>
    </div>
  )
}
