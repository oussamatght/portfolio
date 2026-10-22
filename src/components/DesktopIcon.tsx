import type { ReactNode } from 'react'

type DesktopIconProps = {
  label: string
  icon: ReactNode
  selected?: boolean
  onSelect?: () => void
  onOpen?: () => void
}

export default function DesktopIcon({
  label,
  icon,
  selected = false,
  onSelect,
  onOpen,
}: DesktopIconProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onDoubleClick={onOpen}
      className={`group flex w-24 flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors ${
        selected ? 'bg-cyan-400/20 ring-1 ring-cyan-300/50' : 'hover:bg-white/10'
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
          selected
            ? 'border-cyan-300/60 bg-cyan-400/20 text-cyan-100'
            : 'border-white/15 bg-white/5 text-cyan-200 group-hover:border-cyan-300/40 group-hover:bg-cyan-400/10'
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[11px] leading-tight font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
          selected ? 'text-cyan-100' : 'text-cyan-50/90'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
