import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { Terminal as TerminalIcon } from 'lucide-react'
import WindowFrame from './WindowFrame'
import { projects } from '../data/projects'
import { profile } from '../data/profile'
import * as vfs from '../lib/vfs'

type TerminalAppProps = {
  onClose: () => void
  onMinimize?: () => void
  zIndex?: number
  onOpenProject?: (id: string) => void
  hidden?: boolean
}

type Line = {
  kind: 'input' | 'output' | 'error'
  text: string
}

const FISH_LOGO: Record<string, string[]> = {
  K: [' _  __', '| |/ /', "| ' / ", '| . \\ ', '|_|\\_\\'],
  A: [
    '    /\\    ',
    '   /  \\   ',
    '  / /\\ \\  ',
    ' / ____ \\ ',
    '/_/    \\_\\',
  ],
  L: [' _      ', '| |     ', '| |     ', '| |___  ', '|_____|'],
  I: [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|'],
}

const LOGO_ROWS = ['K', 'A', 'L', 'I'].map((letter) => FISH_LOGO[letter])

const LOGO_LINES = LOGO_ROWS[0].map((_, rowIndex) =>
  LOGO_ROWS.map((letterRow) => letterRow[rowIndex]).join(' ').trimEnd(),
)

const MAN_PAGES: Record<string, string> = {
  help: 'help — list all simulated commands\n\nUsage: help\n\nPrints every available command, grouped by category. This shell is a browser simulation; nothing outside the web page is touched.',
  clear: 'clear — clear the screen\n\nUsage: clear\n\nAlso available through the Ctrl+L shortcut.',
  pwd: 'pwd — print working directory\n\nUsage: pwd\n\nShows the current directory of the simulated filesystem.',
  ls: 'ls — list directory contents\n\nUsage: ls [path] [-a|-l|-la]\n\nLists files and folders. Directories end with "/". No real system is scanned.',
  cd: 'cd — change directory\n\nUsage: cd <dir> | cd .. | cd | cd ~\n\nNavigates the simulated filesystem only.',
  cat: 'cat — print a file\n\nUsage: cat <file>\n\nPrints a simulated text file. Try: cat ~/readme.txt',
  tree: 'tree — show directory tree\n\nUsage: tree [path]\n\nRenders the simulated filesystem as an ASCII tree.',
  neofetch: 'neofetch — Kali-style system info\n\nUsage: neofetch\n\nDisplays the Kali-style logo with simulated system details. "fastfetch" is an alias.',
  uname: 'uname — system summary\n\nUsage: uname | uname -a\n\nSimulated kernel and host details.',
  ping: 'ping — simulated ping\n\nUsage: ping <host> [-c <count>]\n\nRuns a made-up ping: no network packets are exchanged.',
  history: 'history — show previous commands\n\nUsage: history\n\nNumbered list of commands typed during this session.',
  resume: 'resume — CV information\n\nUsage: resume\n\nWhere to find and download the CV (PDF).',
  projects: 'projects — portfolio overview\n\nUsage: projects\n\nLists every portfolio project. Combine with "open <id>".',
  open: 'open — open a project window\n\nUsage: open <project-id>\n\nOpens the File Manager on the given project folder.',
  man: 'man — show a manual page\n\nUsage: man <command>\n\nShort manual pages for the supported commands.',
}

const SKILL_BUCKETS: Array<{ label: string; keywords: string[] }> = [
  {
    label: 'Mobile',
    keywords: ['react native', 'expo', 'eas build', 'sqlite', 'asyncstorage'],
  },
  {
    label: 'Frontend & Web',
    keywords: [
      'react',
      'next',
      'typescript',
      'tailwind',
      'tanstack',
      'shadcn',
      'radix',
      'leaflet',
      'html',
      'css',
      'svg',
    ],
  },
  {
    label: 'Backend & Data',
    keywords: [
      'node',
      'express',
      'mongodb',
      'socket',
      'firebase',
      'api',
      'rest',
      'database',
      'zod',
      'jwt',
      'nitro',
    ],
  },
  {
    label: 'AI & Automation',
    keywords: ['ai agents', 'rag', 'crew ai', 'n8n'],
  },
  {
    label: 'Dev & Deploy',
    keywords: ['git', 'github', 'vercel', 'render', 'vite', 'router'],
  },
]

const SKILLS = (() => {
  const counts = new Map<string, { name: string; count: number }>()
  for (const project of projects) {
    for (const tech of project.stack) {
      const key = tech.toLowerCase()
      const existing = counts.get(key)
      counts.set(key, { name: tech, count: (existing?.count ?? 0) + 1 })
    }
  }
  const items = [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
  const buckets = SKILL_BUCKETS.map((bucket) => {
    const matched = items.filter((item) => {
      const key = item.name.toLowerCase()
      return bucket.keywords.some((keyword) => key.includes(keyword))
    })
    const ids = matched.map((item) => item.name.toLowerCase())
    return {
      label: bucket.label,
      items: matched.filter(
        (item, index) => ids.indexOf(item.name.toLowerCase()) === index,
      ),
    }
  })
  const matchedIds = new Set(
    buckets.flatMap((bucket) => bucket.items.map((item) => item.name.toLowerCase())),
  )
  const others = items.filter((item) => !matchedIds.has(item.name.toLowerCase()))
  return { buckets, others, total: items.length }
})()

const SIMULATED_HOSTS: Record<string, string> = {
  'kali.org': '45.33.51.167',
  'google.com': '142.250.190.46',
  localhost: '127.0.0.1',
}

const tokenize = (command: string): string[] =>
  (command.match(/"[^"]*"|'[^']*'|[^\s"']+/g) ?? []).map((token) =>
    token
      .replace(/^["']/, '')
      .replace(/["']$/, ''),
  )

const ipFor = (host: string) => SIMULATED_HOSTS[host] ?? '93.184.216.34'

const HELP_TEXT = `General
  help              show this help (grouped)
  clear             clear the screen (or Ctrl+L)
  exit              close the terminal window

Filesystem (simulated)
  pwd               print working directory
  ls [path]         list files and folders
  cd <dir>          change directory (cd .. back, cd / or cd ~ for home)
  cat <file>        print a simulated text file
  tree [path]       show directory tree

System info
  whoami            current user
  hostname          machine hostname
  uname [-a]        system summary
  neofetch          Kali-style system info (alias: fastfetch)
  date              current date and time
  uptime            session uptime
  id                user and group ids
  free              memory summary
  df                disk usage
  ps | top          simulated process lists
  ip addr           network interfaces
  ping <host> [-c]  simulated ping
  man <cmd>         manual page for a command

Terminal tools
  echo <text>       print text
  history           previously typed commands

Portfolio
  about             professional profile
  projects          list portfolio projects
  skills            technical skills
  contact           contact details
  social            GitHub / LinkedIn
  resume            CV (PDF) download info
  open <project>    open a project in the File Manager

Note: this is a browser-based simulation — no real Kali Linux
commands are executed anywhere.`

export default function TerminalApp({
  onClose,
  onMinimize,
  zIndex = 10,
  onOpenProject,
  hidden = false,
}: TerminalAppProps) {
  const [lines, setLines] = useState<Line[]>([
    {
      kind: 'output',
      text: 'Kali Portfolio OS terminal — simulated session in your browser.',
    },
    { kind: 'output', text: 'Type "help" for the command list or "neofetch" for system info.' },
  ])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState(vfs.HOME)
  const [prevCwd, setPrevCwd] = useState<string>(vfs.HOME)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bootedAt = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    if (!bootedAt.current) bootedAt.current = Date.now()
    const timers = timersRef
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const push = (line: Line) => setLines((current) => [...current, line])
  const pushAll = (texts: string[], kind: 'output' | 'error') =>
    setLines((current) => [...current, ...texts.map((text) => ({ kind, text }))])

  const promptText = `kali@kali:${vfs.displayPath(cwd)}$`

  const listing = (target: string) => {
    const path = target ? vfs.resolvePath(cwd, target) : cwd
    if (!path) return null
    const entries = vfs.listEntries(path)
    return entries.map((entry) =>
      entry.kind === 'dir' ? `${entry.name}/` : entry.name,
    )
  }

  const schedule = (delay: number, fn: () => void) => {
    const id = window.setTimeout(fn, delay)
    timersRef.current.push(id)
  }

  const run = (raw: string) => {
    const command = raw.trim()
    if (!command) return

    const [name, ...args] = tokenize(command)
    const argument = args.join(' ')
    const lower = name.toLowerCase()

    switch (lower) {
      case 'help': {
        const knownFlag = args.find((flag) => flag !== '')
        if (knownFlag) {
          push({
            kind: 'error',
            text: `help: unknown option "${knownFlag}" — plain "help" prints the full list.`,
          })
          break
        }
        push({ kind: 'output', text: HELP_TEXT })
        break
      }

      case 'ls': {
        const flags = args.filter((item) => item.startsWith('-'))
        const target = args.filter((item) => !item.startsWith('-'))[0] ?? ''
        const allowed = new Set(['-a', '-l', '-la', '-al', '-F', '-f', '-h', '-lah'])
        const bad = flags.find((flag) => !allowed.has(flag))
        if (bad) {
          push({
            kind: 'error',
            text: `ls: unrecognized option '${bad}'\nTry 'man ls' for more information.`,
          })
          break
        }
        const result = listing(target)
        if (result === null) {
          push({
            kind: 'error',
            text: `ls: cannot access '${target || cwd}': No such file or directory`,
          })
          break
        }
        push({
          kind: 'output',
          text: result.length ? result.join('\n') : '(empty directory)',
        })
        break
      }

      case 'cd': {
        if (!argument || argument === '~') {
          const home = vfs.HOME
          if (cwd !== home) {
            setPrevCwd(cwd)
            setCwd(home)
          }
          break
        }
        if (argument === '-') {
          const back = prevCwd
          if (back === cwd) {
            push({ kind: 'error', text: 'cd: no previous directory' })
            break
          }
          setPrevCwd(cwd)
          setCwd(back)
          push({ kind: 'output', text: vfs.displayPath(back) })
          break
        }
        const next = vfs.resolvePath(cwd, argument)
        if (!next) {
          push({
            kind: 'error',
            text: `cd: no such directory: ${argument}`,
          })
          break
        }
        const node = vfs.getNode(next)
        if (node?.kind !== 'dir') {
          push({ kind: 'error', text: `cd: not a directory: ${argument}` })
          break
        }
        if (next === cwd) break
        setPrevCwd(cwd)
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
        if (args.some((item) => item.startsWith('-'))) {
          push({
            kind: 'error',
            text: `cat: command line options are not simulated — 'cat <file>' works.`,
          })
          break
        }
        for (const target of args) {
          const node = vfs.nodeFor(cwd, target)
          if (!node) {
            push({
              kind: 'error',
              text: `cat: ${target}: No such file or directory`,
            })
          } else if (node.kind === 'dir') {
            push({ kind: 'error', text: `cat: ${target}: Is a directory` })
          } else {
            push({ kind: 'output', text: node.content.trimEnd() })
          }
        }
        break
      }

      case 'tree': {
        if (args.some((item) => item.startsWith('-'))) {
          push({
            kind: 'error',
            text: `tree: options are not simulated — 'tree [path]' works.`,
          })
          break
        }
        const path = argument ? vfs.resolvePath(cwd, argument) : cwd
        if (!path) {
          push({
            kind: 'error',
            text: `tree: ${argument || cwd}: No such directory`,
          })
          break
        }
        const node = vfs.getNode(path)
        if (node?.kind !== 'dir') {
          push({ kind: 'error', text: `tree: ${argument}: Not a directory` })
          break
        }
        pushAll(vfs.treeLines(path) ?? [], 'output')
        break
      }

      case 'whoami':
        push({ kind: 'output', text: profile.user })
        break

      case 'hostname':
        push({ kind: 'output', text: profile.hostname })
        break

      case 'uname': {
        push({
          kind: 'output',
          text: args.includes('-a')
            ? `Linux ${profile.hostname} 6.16.0-kali-web  #1 SMP PREEMPT_DYNAMIC (simulated web build) x86_64 GNU/Linux`
            : args.includes('-r')
              ? '6.16.0-kali-web'
              : 'Linux',
        })
        break
      }

      case 'fastfetch':
      case 'neofetch': {
        const uptime = Math.max(0, Date.now() - bootedAt.current)
        const hours = Math.floor(uptime / 3600000)
        const minutes = Math.floor((uptime % 3600000) / 60000)
        const info = [
          `${profile.user}@${profile.hostname}`,
          '--------------------',
          'OS: Kali GNU/Linux Portfolio OS (simulated)',
          'Kernel: 6.16.0-kali-web',
          `Uptime: ${hours}h ${minutes}m (session)`,
          'Shell: react-term 5.2',
          `Resolution: ${window.innerWidth}x${window.innerHeight}`,
          'DE: OussamaWM 1.0',
          'Theme: Neon Dragon',
          'Terminal: portfolio-term',
          `CPU: Intel i7 (simulated) [${Math.max(2, navigator.hardwareConcurrency)} cores]`,
          'Memory: 4.1 GiB / 15.4 GiB',
          'Disk: 8.2G / 20G (44%)',
          'Packages: 1337 (this portfolio only < 100)',
        ]
        const width = Math.max(...LOGO_LINES.map((line) => line.length)) + 4
        const rows = Math.max(LOGO_LINES.length, info.length)
        const merged: string[] = []
        for (let index = 0; index < rows; index += 1) {
          const logo = (LOGO_LINES[index] ?? '').padEnd(width)
          merged.push(`${logo}${info[index] ?? ''}`.trimEnd())
        }
        push({ kind: 'output', text: merged.join('\n') })
        break
      }

      case 'date':
        push({ kind: 'output', text: new Date().toString() })
        break

      case 'echo': {
        if (!argument) {
          push({ kind: 'output', text: '' })
          break
        }
        const expanded = argument
          .replace(/\$USER/g, profile.user)
          .replace(/\$HOME/g, vfs.HOME)
          .replace(/\$PWD/g, cwd)
          .replace(/(["'])/g, '')
        push({ kind: 'output', text: expanded })
        break
      }

      case 'history': {
        if (!history.length) break
        push({
          kind: 'output',
          text: [...history]
            .reverse()
            .map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`)
            .join('\n'),
        })
        break
      }

      case 'uptime': {
        const minutes = Math.max(1, Math.floor((Date.now() - bootedAt.current) / 60000))
        push({
          kind: 'output',
          text: ` ${new Date().toLocaleTimeString([], { hour12: false })} up ${minutes} min,  1 user,  load average: 0.52, 0.38, 0.31`,
        })
        break
      }

      case 'id':
        push({
          kind: 'output',
          text: `uid=1000(${profile.user}) gid=1000(${profile.user}) groups=1000(${profile.user}),27(sudo),100(users)`,
        })
        break

      case 'free':
        push({
          kind: 'output',
          text: [
            '               total        used        free      shared  buff/cache   available',
            'Mem:        15790MiB    4210MiB   10480MiB        0MiB    1100MiB   11200MiB',
            'Swap:        2048MiB       0MiB    2048MiB',
          ].join('\n'),
        })
        break

      case 'df':
        push({
          kind: 'output',
          text: [
            'Filesystem      Size  Used Avail Use% Mounted on',
            '/dev/sda1        20G  8.2G   11G  45% /',
            'tmpfs           7.7G     0  7.7G   0% /dev/shm',
            '/dev/sdb1       256G  112G  144G  44% /media/portfolio',
          ].join('\n'),
        })
        break

      case 'ps':
        push({
          kind: 'output',
          text: [
            '  PID TTY          TIME CMD',
            '    1 ?        00:00:14 systemd (simulated)',
            '  183 ?        00:01:02 OussamaWM',
            '  246 ?        00:00:38 desktop-shell',
            '  512 ?        00:00:11 portfolio-files',
            ' 1337 pts/0    00:00:00 portfolio-term (this session)',
          ].join('\n'),
        })
        break

      case 'top':
        push({
          kind: 'output',
          text: [
            `top - ${new Date().toLocaleTimeString([], { hour12: false })} up  ${Math.max(
              1,
              Math.floor((Date.now() - bootedAt.current) / 60000),
            )} min,  1 user,  load average: 0.52, 0.38, 0.31`,
            'Tasks:  77 total,   1 running,  76 sleeping',
            '%Cpu(s): 12.0 us,  3.1 sy,  0.0 ni, 84.9 id',
            'MiB Mem :  15790 total,  10480 free,   4210 used,   1100 buff/cache',
            '',
            '  PID USER      %CPU %MEM COMMAND',
            '  183 kali       3.4 12.1 OussamaWM',
            '  512 kali       2.1  4.5 portfolio-files',
            ' 246  kali       1.2  3.3 desktop-shell',
            ' 1337 kali       0.4  1.1 portfolio-term',
          ].join('\n'),
        })
        break

      case 'ip': {
        const sub = args[0]?.toLowerCase()
        if (!sub || !['addr', 'a', 'address', 'link'].includes(sub)) {
          push({
            kind: 'error',
            text: `ip: unsupported subcommand "${sub ?? ''}" in this simulation — try "ip addr".`,
          })
          break
        }
        push({
          kind: 'output',
          text: [
            '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
            '    inet 127.0.0.1/8 scope host lo',
            '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
            '    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0',
          ].join('\n'),
        })
        break
      }

      case 'ping': {
        const options = args.filter((item) => item.startsWith('-'))
        const target = args.filter((item) => !item.startsWith('-'))[0]
        const bad = options.find((flag) => flag !== '-c')
        if (bad) {
          push({
            kind: 'error',
            text: `ping: unsupported option '${bad}' — try "ping <host> [-c <count>]".`,
          })
          break
        }
        if (!target) {
          push({
            kind: 'error',
            text: 'ping: missing host operand — try "ping kali.org"',
          })
          break
        }
        const countIndex = args.indexOf('-c')
        const requested =
          countIndex >= 0 ? parseInt(args[countIndex + 1] ?? '', 10) : NaN
        const count = Number.isFinite(requested)
          ? Math.min(4, Math.max(1, requested))
          : 4
        const ip = ipFor(target.toLowerCase())
        push({
          kind: 'output',
          text: `PING ${target} (${ip}) — simulated ping, no real packets are sent`,
        })
        const latencyBase = 18 + (ip.split('.').reduce((sum, part) => sum + Number(part), 0) % 23)
        for (let index = 0; index < count; index += 1) {
          const seq = index + 1
          const latency = (latencyBase + (seq * 7) % 11).toFixed(1)
          schedule(420 * seq, () =>
            push({
              kind: 'output',
              text: `64 bytes from ${ip}: icmp_seq=${seq} ttl=56 time=${latency} ms`,
            }),
          )
        }
        schedule(420 * count + 260, () => {
          push({
            kind: 'output',
            text: `--- ${target} ping statistics (simulated) ---\n${count} packets transmitted, ${count} received, 0% packet loss`,
          })
        })
        break
      }

      case 'man': {
        if (!argument) {
          push({
            kind: 'error',
            text: `What manual page do you want?\nAvailable pages: ${Object.keys(MAN_PAGES).join(' ')}`,
          })
          break
        }
        const page = MAN_PAGES[argument.toLowerCase()]
        if (!page) {
          push({
            kind: 'error',
            text: `No manual entry for ${argument}. Try: man man`,
          })
          break
        }
        push({ kind: 'output', text: page })
        break
      }

      case 'about':
        push({
          kind: 'output',
          text: [
            `${profile.name} — ${profile.role}`,
            '',
            'Full-stack web & mobile developer. I build real products end to',
            'end: React/Next.js frontends, Node/Express APIs, MongoDB data and',
            'React Native apps shipped to Google Play & the App Store.',
            '',
            'This desktop, simulated filesystem and terminal are hand-built',
            'with React + TypeScript + Tailwind CSS.',
            '',
            'Run: projects, skills, contact, social, resume — or open <id>.',
          ].join('\n'),
        })
        break

      case 'projects': {
        const rows = projects.map(
          (project) =>
            `${project.id.padEnd(Math.max(18, ...projects.map((item) => item.id.length)))} ${project.year}  ${project.tagline ?? project.description}`,
        )
        push({
          kind: 'output',
          text: `${rows.join('\n')}\n\n${projects.length} projects — run "open <id>" to browse folder contents.`,
        })
        break
      }

      case 'skills': {
        const rows = SKILLS.buckets.map((bucket) => {
          const names =
            bucket.items.length > 0
              ? bucket.items.map((item) => `${item.name} (${item.count})`).join('  •  ')
              : '—'
          return `${bucket.label.padEnd(16)} ${names}`
        })
        if (SKILLS.others.length) {
          rows.push(
            `${'Other'.padEnd(16)} ${SKILLS.others
              .map((item) => `${item.name} (${item.count})`)
              .join('  •  ')}`,
          )
        }
        push({
          kind: 'output',
          text: `Skills derived from the ${SKILLS.total} unique technologies across the portfolio:\n\n${rows.join('\n')}`,
        })
        break
      }

      case 'contact':
        push({
          kind: 'output',
          text: [
            `GitHub     ${profile.github}`,
            `LinkedIn   ${profile.linkedin}`,
            `Email      ${profile.emailLabel}`,
            '',
            'Everything here is real and reachable — no simulated links.',
          ].join('\n'),
        })
        break

      case 'social':
        push({
          kind: 'output',
          text: [
            `GitHub:    ${profile.github}`,
            `LinkedIn:  ${profile.linkedin}`,
            '',
            'Email:    "contact" has the full details.',
          ].join('\n'),
        })
        break

      case 'resume':
        push({
          kind: 'output',
          text: [
            'CV / RESUME (PDF)',
            '-----------------',
            `File:        ${profile.resumePath}`,
            `Downloads as: ${profile.resumeFileName}`,
            '',
            'Ways to get it:',
            `  1. "Download CV (PDF)" button in the About window`,
            `  2. Same button in the app menu (top bar, left avatar)`,
            `  3. Direct link: ${profile.resumePath}`,
            '',
            `Details also live at ~/Documents/resume.txt ("cat ~/Documents/resume.txt").`,
          ].join('\n'),
        })
        break

      case 'open': {
        const project = projects.find(
          (item) =>
            item.id.toLowerCase() === argument.toLowerCase() ||
            item.name.toLowerCase() === argument.toLowerCase(),
        )
        if (!project) {
          push({
            kind: 'error',
            text: `open: unknown project "${argument}" — run "projects" for valid ids.`,
          })
          break
        }
        onOpenProject?.(project.id)
        push({ kind: 'output', text: `Opening ${project.name} in the File Manager...` })
        break
      }

      case 'clear':
        setLines([])
        setHistoryIndex(-1)
        break

      case 'exit':
        onClose()
        break

      default:
        push({
          kind: 'error',
          text: `${name}: command not found\nRun "help" for the list of simulated commands.`,
        })
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const command = input
    setInput('')
    if (!command.trim()) return
    setHistory((current) =>
      current[0] === command ? current : [command, ...current],
    )
    setHistoryIndex(-1)
    run(command)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      setLines([])
      setHistoryIndex(-1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!history.length) return
      const next = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(next)
      setInput(history[next] ?? '')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (historyIndex < 0) return
      const next = historyIndex - 1
      setHistoryIndex(next)
      setInput(next >= 0 ? (history[next] ?? '') : '')
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const value = input.trim()
      if (!value) return
      const candidates = Object.keys(MAN_PAGES).filter((entry) =>
        entry.startsWith(value.toLowerCase()),
      )
      if (candidates.length === 1) setInput(candidates[0])
      else if (candidates.length > 1 && input) {
        setInput(candidates[0])
      }
      return
    }
  }

  return (
    <WindowFrame
      title="kali@kali-portfolio: terminal"
      icon={<TerminalIcon size={14} />}
      onClose={onClose}
      onMinimize={onMinimize}
      zIndex={zIndex}
      hidden={hidden}
      initialPosition={{ x: 200, y: 140 }}
      initialSize={{ width: 720, height: 440 }}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        className="h-full cursor-text overflow-y-auto bg-[#04070c] p-3 font-mono text-[12.5px] leading-relaxed"
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

        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-cyan-300">
          <span className="min-w-0 break-all">{promptText}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
            className="min-w-[12ch] max-w-full flex-1 bg-transparent text-emerald-300 outline-none"
          />
        </form>
      </div>
    </WindowFrame>
  )
}
