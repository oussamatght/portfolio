import { useCallback, useEffect, useRef, useState } from 'react'
import GrubMenu from './GrubMenu'
import GrubSubmenu from './GrubSubmenu'
import LinuxBootLog from './LinuxBootLog'
import LogoSplash from './LogoSplash'
import MemoryTestScreen from './MemoryTestScreen'
import RecoveryConsole from './RecoveryConsole'

type BootStage =
  | 'firmware'
  | 'grub'
  | 'advanced-menu'
  | 'recovery'
  | 'boot-log'
  | 'logo-splash'
  | 'memtest'

type BootSequenceProps = {
  /** Mounts the existing portfolio desktop. */
  onComplete: () => void
}

const FIRMWARE_LINES = [
  'SeaBIOS (version kali-portfolio-os-1.0.0)',
  'Booting from Hard Disk ...',
  'Detecting CPU ................ x86-64, 32 threads',
  'Detecting memory ............. 16384MB OK',
  'Initializing UEFI variables .. done',
  'Enumerating NVMe0n0 .......... KaliSSD-1TB ready',
  'Loading /boot/efi/EFI/kali/grubx64.efi ... done',
]

const INTERVAL_MS = 170
const FIRMWARE_TAIL_MS = 800

const GRUB_ENTRIES = [
  'Kali GNU/Linux Rolling 2026.1',
  'Advanced options for Kali GNU/Linux Rolling 2026.1',
  'Memory test (memtest86+)',
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

/**
 * State machine: firmware → grub → advanced-menu → recovery / boot-log →
 * logo-splash → desktop, plus the memtest branch back to grub.
 * Every screen owns its own timers/listeners and cleans up on unmount.
 */
export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<BootStage>('firmware')
  const [firmwareCount, setFirmwareCount] = useState(0)
  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  /* Stage 1 — BIOS/UEFI-style firmware startup. */
  useEffect(() => {
    if (stage !== 'firmware') return
    let clock = 0
    FIRMWARE_LINES.forEach((_, index) => {
      clock += INTERVAL_MS
      timersRef.current.push(
        window.setTimeout(() => setFirmwareCount(index + 1), clock),
      )
    })
    timersRef.current.push(
      window.setTimeout(() => setStage('grub'), clock + FIRMWARE_TAIL_MS),
    )
    return clearTimers
  }, [stage, clearTimers])

  /* Any key during the firmware flash skips ahead to GRUB. */
  useEffect(() => {
    if (stage !== 'firmware') return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED_KEYS.includes(event.key)) return
      event.preventDefault()
      clearTimers()
      setStage('grub')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, clearTimers])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black font-mono text-[11px] leading-[1.5] text-neutral-300 sm:text-[13px]">
      {stage === 'firmware' && (
        <div className="stage-in flex h-full w-full flex-col px-3 py-3 sm:px-6 sm:py-4">
          <div className="whitespace-pre-wrap break-words">
            {FIRMWARE_LINES.slice(0, firmwareCount).map((line) => (
              <p key={line} className="text-neutral-400">
                {line}
              </p>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-neutral-700 sm:text-[11px]">
            press any key to enter the boot menu
          </p>
        </div>
      )}

      {stage === 'grub' && (
        <GrubMenu
          entries={GRUB_ENTRIES}
          countdownSeconds={15}
          defaultIndex={0}
          onSelect={(index) => {
            if (index === 1) setStage('advanced-menu')
            else if (index === 2) setStage('memtest')
            else setStage('boot-log')
          }}
        />
      )}

      {stage === 'advanced-menu' && (
        <GrubSubmenu
          onBoot={() => setStage('boot-log')}
          onRecovery={() => setStage('recovery')}
          onBack={() => setStage('grub')}
        />
      )}

      {stage === 'recovery' && (
        <RecoveryConsole
          onContinue={() => setStage('boot-log')}
          onReturn={() => setStage('grub')}
        />
      )}

      {stage === 'boot-log' && (
        <LinuxBootLog
          onDone={() => setStage('logo-splash')}
          onEscape={() => setStage('grub')}
        />
      )}

      {stage === 'logo-splash' && <LogoSplash onDone={onComplete} />}

      {stage === 'memtest' && <MemoryTestScreen onExit={() => setStage('grub')} />}
    </div>
  )
}
