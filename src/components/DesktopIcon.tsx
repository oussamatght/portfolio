import type { ReactNode } from 'react'
import { useCoarsePointer } from '../hooks/useCoarsePointer'

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
  const isCoarsePointer = useCoarsePointer()

  return (
    <button
      type="button"
      onClick={isCoarsePointer ? onOpen : onSelect}
      onDoubleClick={onOpen}
      className={`group flex w-full max-w-24 min-w-0 flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors ${
        selected ? 'bg-cyan-400/20 ring-1 ring-cyan-300/50' : 'hover:bg-white/10'
      }`}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl border transition-all ${
          selected
            ? 'border-cyan-300/60 bg-cyan-400/20 text-cyan-100'
            : 'border-white/15 bg-white/5 text-cyan-200 group-hover:border-cyan-300/40 group-hover:bg-cyan-400/10'
        }`}
      >
        {icon}
      </span>
      <span
        className={`min-w-0 break-words text-[11px] font-medium leading-tight line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
          selected ? 'text-cyan-100' : 'text-cyan-50/90'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
