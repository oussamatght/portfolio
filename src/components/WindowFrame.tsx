import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
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

type Workspace = { width: number; height: number }
type Geometry = {
  position: { x: number; y: number }
  size: { width: number; height: number }
}

/** Safe spacing kept between a window and every workspace edge. */
const WORKSPACE_INSET = 8
const MIN_WINDOW_WIDTH = 260
const MIN_WINDOW_HEIGHT = 176

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** Keep a window fully inside the workspace, shrinking it only when needed. */
function constrainGeometry(geometry: Geometry, workspace: Workspace): Geometry {
  const maxFitWidth = Math.max(
    MIN_WINDOW_WIDTH,
    workspace.width - WORKSPACE_INSET * 2,
  )
  const maxFitHeight = Math.max(
    MIN_WINDOW_HEIGHT,
    workspace.height - WORKSPACE_INSET * 2,
  )
  const size = {
    width: clamp(geometry.size.width, MIN_WINDOW_WIDTH, maxFitWidth),
    height: clamp(geometry.size.height, MIN_WINDOW_HEIGHT, maxFitHeight),
  }
  return {
    position: {
      x: clamp(
        geometry.position.x,
        WORKSPACE_INSET,
        Math.max(WORKSPACE_INSET, workspace.width - size.width - WORKSPACE_INSET),
      ),
      y: clamp(
        geometry.position.y,
        WORKSPACE_INSET,
        Math.max(WORKSPACE_INSET, workspace.height - size.height - WORKSPACE_INSET),
      ),
    },
    size,
  }
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
  const rootRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [maximized, setMaximized] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  // Latest pre-maximize geometry, restored when un-maximizing.
  const restoreRef = useRef<Geometry | null>(null)
  const dragRef = useRef<{
    pointerId: number
    offsetX: number
    offsetY: number
    startX: number
    startY: number
  } | null>(null)

  // The workspace is the nearest positioned ancestor (`<main>`). Observe it so
  // windows stay bounded when the viewport resizes or rotates while open.
  useLayoutEffect(() => {
    const rootElement = rootRef.current
    const workspaceElement = rootElement?.offsetParent
    if (!(rootElement && workspaceElement)) return

    const measure = () => {
      const bounds = workspaceElement.getBoundingClientRect()
      setWorkspace({ width: bounds.width, height: bounds.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(workspaceElement)
    return () => observer.disconnect()
  }, [])

  // Derived, render-time geometry: the raw geometry stays as the user left it,
  // while the rendered window is always fully inside the current workspace.
  const constrained = workspace
    ? constrainGeometry({ position, size }, workspace)
    : { position, size }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (maximized) return
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button')) return

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - constrained.position.x,
      offsetY: event.clientY - constrained.position.y,
      startX: constrained.position.x,
      startY: constrained.position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const nextX = drag.startX + (event.clientX - drag.offsetX)
    const nextY = drag.startY + (event.clientY - drag.offsetY)
    const maxX = workspace
      ? Math.max(
          WORKSPACE_INSET,
          workspace.width - constrained.size.width - WORKSPACE_INSET,
        )
      : Number.POSITIVE_INFINITY
    const maxY = workspace
      ? Math.max(
          WORKSPACE_INSET,
          workspace.height - constrained.size.height - WORKSPACE_INSET,
        )
      : Number.POSITIVE_INFINITY

    setPosition({
      x: clamp(nextX, WORKSPACE_INSET, maxX),
      y: clamp(nextY, WORKSPACE_INSET, maxY),
    })
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const toggleMaximize = () => {
    if (maximized) {
      const restore = restoreRef.current
      if (restore) {
        setPosition(restore.position)
        setSize(restore.size)
      }
    } else {
      restoreRef.current = { position: constrained.position, size }
    }
    setMaximized((value) => !value)
  }

  const frameStyle = maximized
    ? { left: 0, top: 0, width: '100%', height: '100%' }
    : {
        left: constrained.position.x,
        top: constrained.position.y,
        width: constrained.size.width,
        height: constrained.size.height,
      }

  return (
    <div
      ref={rootRef}
      style={{ ...frameStyle, zIndex }}
      className="absolute flex flex-col overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0b0f16]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-md"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex shrink-0 touch-none cursor-grab items-center gap-2 border-b border-cyan-300/15 bg-gradient-to-r from-cyan-500/15 to-transparent px-3 py-2 active:cursor-grabbing"
      >
        <span className="text-cyan-300">{icon}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-cyan-100/90">{title}</span>

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
