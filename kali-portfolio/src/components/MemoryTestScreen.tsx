import { useEffect, useRef, useState } from 'react'

type MemoryTestScreenProps = {
  /** Exit back to the main GRUB menu (button, Escape, or auto-complete). */
  onExit: () => void
}

/** Bounded, deterministic simulation — always finishes and can be exited. */
const TOTAL_MS = 9000
const TICK_MS = 100
const BLOCKS = 34

const TEST_LABELS = [
  'Test #1 [Address test, walking ones, no cache]',
  'Test #2 [Address test, own address]',
  'Test #3 [Moving inversions, ones & zeroes]',
  'Test #4 [Random number sequence]',
  'Test #5 [Block move, 80 moves]',
  'Test #6 [Moving inversions, 8-bit pattern]',
  'Test #7 [Moving inversions, random pattern]',
  'Test #8 [Modulo 20, random pattern]',
]

export default function MemoryTestScreen({ onExit }: MemoryTestScreenProps) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const onExitRef = useRef(onExit)

  useEffect(() => {
    onExitRef.current = onExit
  }, [onExit])

  const finished = elapsedMs >= TOTAL_MS

  useEffect(() => {
    if (finished) return
    const id = window.setInterval(
      () => setElapsedMs((ms) => Math.min(ms + TICK_MS, TOTAL_MS)),
      TICK_MS,
    )
    return () => window.clearInterval(id)
  }, [finished])

  /* Never runs forever: auto-return shortly after 100%. */
  useEffect(() => {
    if (!finished) return
    const id = window.setTimeout(() => onExitRef.current(), 2600)
    return () => window.clearTimeout(id)
  }, [finished])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onExitRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const progress = Math.min(100, Math.round((elapsedMs / TOTAL_MS) * 100))
  const pass = Math.min(8, Math.floor((elapsedMs / TOTAL_MS) * 8) + 1)
  const testLabel = TEST_LABELS[Math.floor(elapsedMs / (TOTAL_MS / TEST_LABELS.length)) % TEST_LABELS.length]
  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const timeLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
    elapsedSeconds % 60,
  ).padStart(2, '0')}`
  const filledBlocks = Math.round((progress / 100) * BLOCKS)
  const bar =
    '█'.repeat(filledBlocks) + '░'.repeat(BLOCKS - filledBlocks)

  return (
    <div className="stage-in flex h-full w-full flex-col items-center justify-center overflow-y-auto px-4 py-6">
      <div className="w-full max-w-xl border border-neutral-800 bg-black p-4 sm:p-6">
        <p className="font-mono text-sm text-neutral-100">
          Memtest86+ — Memory Diagnostic
        </p>
        <p className="mt-0.5 text-[10px] text-neutral-500">
          visual simulation
        </p>

        <div className="mt-5 grid gap-x-8 gap-y-1.5 font-mono text-[11px] text-neutral-400 sm:grid-cols-2">
          <p>CPUs ........ 8x x86-64 (simulated)</p>
          <p>L1 Cache .. 512K &nbsp;50623 MB/s</p>
          <p>Mem ......... 16384MB &nbsp;12650 MB/s</p>
          <p>L3 Cache .. 16M &nbsp;15237 MB/s</p>
          <p>Chipset ..... Virtual Kali Chipset</p>
          <p>Errors ...... 0</p>
        </div>

        <p className="mt-5 font-mono text-[11px] text-neutral-300">{testLabel}</p>
        <p className="mt-1 font-mono text-[11px] text-neutral-400">
          Pattern: 0x5a5a5a5a
        </p>

        <p className="mt-5 font-mono text-[11px] text-neutral-400">
          Pass <span className="text-neutral-100">{pass}/8</span>
          <span className="ml-6">
            Elapsed{' '}
            <span className="tabular-nums text-neutral-100">{timeLabel}</span>
          </span>
        </p>

        <pre className="mt-4 whitespace-pre font-mono text-[13px] leading-none text-blue-400">
          {bar}
        </pre>
        <p className="mt-2 font-mono text-sm tabular-nums text-neutral-100">
          {progress}%
        </p>

        {finished && (
          <p className="mt-4 text-[11px] text-neutral-300">
            Memory test complete — 0 errors found. Returning to GRUB menu...
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => onExitRef.current()}
          className="border border-neutral-700 px-4 py-2 font-mono text-[11px] text-neutral-300 transition hover:bg-neutral-800 sm:text-[12px]"
        >
          Exit (Esc) — return to GRUB
        </button>
        <p className="text-center text-[10px] text-neutral-600">
          Visual simulation only — this page does not test your computer&apos;s
          RAM.
        </p>
      </div>
    </div>
  )
}
