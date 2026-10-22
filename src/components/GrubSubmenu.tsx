import GrubMenu from './GrubMenu'

type GrubSubmenuProps = {
  /** Start the normal desktop boot path. */
  onBoot: () => void
  /** Open the simulated recovery console. */
  onRecovery: () => void
  /** Escape / explicit entry: return to the main GRUB menu. */
  onBack: () => void
}

const ENTRIES = [
  'Kali GNU/Linux Rolling 2026.1',
  'Kali GNU/Linux Rolling 2026.1 (recovery mode)',
  'Return to main menu',
]

export default function GrubSubmenu({
  onBoot,
  onRecovery,
  onBack,
}: GrubSubmenuProps) {
  return (
    <GrubMenu
      entries={ENTRIES}
      onSelect={(index) =>
        index === 2 ? onBack() : index === 1 ? onRecovery() : onBoot()
      }
      onEscape={onBack}
      header="GNU GRUB  version 2.06-13"
      helpLines={[
        'Use the ↑ and ↓ keys to select which entry is highlighted.',
        'Press Enter to boot the selected entry.',
        'Press Escape to return to the main menu.',
      ]}
    />
  )
}
