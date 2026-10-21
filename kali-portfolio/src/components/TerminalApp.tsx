import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Terminal as TerminalIcon } from 'lucide-react'
import WindowFrame from './WindowFrame'
import { projects } from '../data/projects'

type TerminalAppProps = {
  onClose: () => void
  onMinimize?: () => void
  zIndex?: number
  onOpenProject?: (id: string) => void
}

type Line = {
  kind: 'input' | 'output' | 'error'
  text: string
}

const NEOFETCH = String.raw`
       .--.        .--.        .--.
      :    :      :    :      :    :
     :        :  :        :  :        :
     :        :  :   .--. :  :        :
      :    :      :  :  :  :      :    :
       '--'        '--'        '--'
`

const HOME_LISTING = ['projects/', 'Desktop/', 'Documents/', 'Downloads/', 'readme.txt']

export default function TerminalApp({
  onClose,
  onMinimize,
  zIndex = 10,
  onOpenProject,
}: TerminalAppProps) {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'output', text: 'Kali Portfolio OS terminal — type "help" to get started.' },
  ])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/home/kali')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const push = (line: Line) => setLines((current) => [...current, line])

  const listing = () => {
    if (cwd === '/home/kali') return HOME_LISTING
    if (cwd === '/home/kali/projects') return projects.map((project) => project.name + '/')
    const project = projects.find((item) => item.path === cwd)
    return project ? project.files.map((file) => file.name) : []
  }

  const resolvePath = (target: string) => {
    if (target === '~' || target === '/home/kali') return '/home/kali'
    if (target === '..') {
      if (cwd === '/home/kali/projects') return '/home/kali'
      if (cwd === '/home/kali') return '/home/kali'
      return '/home/kali/projects'
    }
    if (target === 'projects' && cwd === '/home/kali') return '/home/kali/projects'
    if (cwd === '/home/kali/projects') {
      const project = projects.find((item) => item.name.toLowerCase() === target.toLowerCase())
      if (project) return project.path
    }
    return null
  }

  const run = (raw: string) => {
    const command = raw.trim()
    push({ kind: 'input', text: `kali@kali:${cwd}$ ${command}` })
    if (!command) return

    const [name, ...args] = command.split(/\s+/)
    const argument = args.join(' ')

    switch (name.toLowerCase()) {
      case 'help':
        push({
          kind: 'output',
          text: [
            'help      show this help',
            'ls        list directory contents',
            'cd <dir>  change directory',
            'pwd       print working directory',
            'cat <f>   print a file',
            'projects  list portfolio projects',
            'open <p>  open a project window',
            'whoami    current user',
            'neofetch  system information',
            'date      current date and time',
            'clear     clear the screen',
            'exit      close the terminal',
          ].join('\n'),
        })
        break

      case 'ls':
        push({ kind: 'output', text: listing().join('\n') || '' })
        break

      case 'cd': {
        if (!argument) {
          push({ kind: 'output', text: cwd })
          break
        }
        const next = resolvePath(argument)
        if (!next) {
          push({ kind: 'error', text: `cd: no such directory: ${argument}` })
          break
        }
        setCwd(next)
        break
      }

      case 'pwd':
        push({ kind: 'output', text: cwd })
        break

      case 'cat': {
        if (!argument) {
          push({ kind: 'error', text: 'cat: missing file operand' })
          break
        }
        const known = listing().some((entry) => entry.replace('/', '') === argument)
        push({
          kind: known ? 'output' : 'error',
          text: known
            ? `# ${argument}\nBuilt with care. Full source available in the project window.`
            : `cat: ${argument}: No such file or directory`,
        })
        break
      }

      case 'projects':
        push({
          kind: 'output',
          text: projects
            .map((project) => `${project.name.padEnd(18)} ${project.description}`)
            .join('\n'),
        })
        break

      case 'open': {
        const project = projects.find((item) => item.name.toLowerCase() === argument.toLowerCase())
        if (!project) {
          push({ kind: 'error', text: `open: unknown project: ${argument}` })
          break
        }
        onOpenProject?.(project.id)
        push({ kind: 'output', text: `Opening ${project.name}...` })
        break
      }

      case 'whoami':
        push({ kind: 'output', text: 'kali' })
        break

      case 'neofetch':
        push({
          kind: 'output',
          text: `${NEOFETCH}\n  kali@kali-portfolio\n  OS: Kali GNU/Linux Rolling 2026.1\n  Shell: ksh 5.2\n  Resolution: ${window.innerWidth}x${window.innerHeight}\n  Terminal: kali-portfolio-term\n  Theme: Neon Dragon`,
        })
        break

      case 'date':
        push({ kind: 'output', text: new Date().toString() })
        break

      case 'clear':
        setLines([])
        break

      case 'exit':
        onClose()
        break

      default:
        push({ kind: 'error', text: `${name}: command not found. Try "help".` })
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const command = input
    setInput('')
    setHistory((current) => [command, ...current])
    setHistoryIndex(-1)
    run(command)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (next >= 0) {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = historyIndex - 1
      setHistoryIndex(next)
      setInput(next >= 0 ? history[next] : '')
    }
  }

  return (
    <WindowFrame
      title="kali@kali-portfolio: terminal"
      icon={<TerminalIcon size={14} />}
      onClose={onClose}
      onMinimize={onMinimize}
      zIndex={zIndex}
      initialPosition={{ x: 200, y: 140 }}
      initialSize={{ width: 720, height: 440 }}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        className="terminal-scrollbar h-full cursor-text overflow-y-auto bg-[#04070c] p-3 font-mono text-[12.5px] leading-relaxed"
      >
        {lines.map((line, index) => (
          <pre
            key={index}
            className={`whitespace-pre-wrap break-words ${
              line.kind === 'input'
                ? 'text-cyan-300'
                : line.kind === 'error'
                  ? 'text-rose-400'
                  : 'text-emerald-300/90'
            }`}
          >
            {line.text}
          </pre>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 text-cyan-300">
          <span className="shrink-0">kali@kali:{cwd}$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent text-emerald-300 outline-none"
          />
        </form>
      </div>
    </WindowFrame>
  )
}
