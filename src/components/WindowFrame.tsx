import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Minus, Square, X } from 'lucide-react'

type WindowFrameProps = {
  title: string
  icon?: ReactNode
  children: ReactNode
  onClose: () => void
  onMinimize?: () => void
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  zIndex?: number
}

export default function WindowFrame({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  initialPosition = { x: 120, y: 80 },
  initialSize = { width: 880, height: 560 },
  zIndex = 10,
}: WindowFrameProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [maximized, setMaximized] = useState(false)
  const dragRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
    startX: number
    startY: number
  } | null>(null)

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized) return
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button')) return

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      startX: position.x,
      startY: position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setPosition({
      x: Math.max(0, drag.startX + (event.clientX - drag.offsetX)),
      y: Math.max(0, drag.startY + (event.clientY - drag.offsetY)),
    })
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const toggleMaximize = () => {
    setMaximized((value) => !value)
    setPosition({ x: 0, y: 0 })
    setSize(initialSize)
  }

  const frameStyle = maximized
    ? { left: 0, top: 0, width: '100%', height: '100%' }
    : { left: position.x, top: position.y, width: size.width, height: size.height }

  return (
    <div
      style={{ ...frameStyle, zIndex }}
      className="absolute flex flex-col overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0b0f16]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-md"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex shrink-0 cursor-grab items-center gap-2 border-b border-cyan-300/15 bg-gradient-to-r from-cyan-500/15 to-transparent px-3 py-2 active:cursor-grabbing"
      >
        <span className="text-cyan-300">{icon}</span>
        <span className="flex-1 truncate font-mono text-xs text-cyan-100/90">{title}</span>

        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              aria-label="Minimize"
              className="rounded-md p-1 text-cyan-200/70 transition hover:bg-white/10 hover:text-cyan-100"
            >
              <Minus size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMaximize}
            aria-label="Maximize"
            className="rounded-md p-1 text-cyan-200/70 transition hover:bg-white/10 hover:text-cyan-100"
          >
            <Square size={12} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-cyan-200/70 transition hover:bg-rose-500/20 hover:text-rose-200"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
