import { useCoarsePointer } from '../hooks/useCoarsePointer'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

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

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onSelect?.()
    if (isCoarsePointer || event.detail === 0) {
      onOpen?.()
    }
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={`Open ${label}`}
      aria-pressed={selected}
      onClick={handleClick}
      onDoubleClick={onOpen}
      className={`group flex h-full w-full min-w-0 select-none flex-col items-center justify-start gap-1.5 rounded-xl px-1 py-2 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300/70 ${
        selected
          ? 'bg-cyan-400/20 ring-1 ring-cyan-300/60'
          : 'ring-1 ring-transparent hover:bg-cyan-400/10 hover:ring-cyan-300/25'
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all ${
          selected
            ? 'border-cyan-300/60 bg-cyan-400/20 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.28)]'
            : 'border-white/15 bg-white/5 text-cyan-200 group-hover:border-cyan-300/40 group-hover:bg-cyan-400/10 group-active:scale-95'
        }`}
      >
        {icon}
      </span>
      <span
        className={`w-full min-w-0 break-words text-[11px] font-medium leading-tight line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${
          selected ? 'text-cyan-100' : 'text-cyan-50/90'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
