import { projects, type Project } from '../data/projects'
import { profile } from '../data/profile'

export const HOME = `/home/${profile.user}`

export type FileNode = { kind: 'file'; content: string }
export type DirNode = { kind: 'dir'; children: Record<string, VfsNode> }
export type VfsNode = FileNode | DirNode
export type VfsEntry = { name: string; kind: 'file' | 'dir' }

const file = (content: string): FileNode => ({ kind: 'file', content })
const dir = (children: Record<string, VfsNode> = {}): DirNode => ({
  kind: 'dir',
  children,
})

const HOME_README = `Oussama OS — Kali-style portfolio workspace (browser simulation)
====================================================================

Everything you see here runs locally in your browser as a React
simulation. No real Kali Linux commands are executed anywhere.

Commands worth trying in the terminal:

  help        full command list, grouped by category
  neofetch    Kali-style system information
  projects    list the portfolio projects
  tree ~      explore this simulated filesystem
  resume      how to download the CV (PDF)
  about       who is behind this workspace
  open <id>   open a project in the File Manager

Tip: press Up/Down to replay previous commands, Ctrl+L clears the screen.`

const RESUME_TXT = `CV / RESUME
===========

My CV ships with this workspace as a real PDF file:

  URL:       ${profile.resumePath}
  Saved as:  ${profile.resumeFileName}

Easiest ways to download it:

  1. The "Download CV (PDF)" button inside the About window.
  2. The same button in the application menu (top bar, left).
  3. Open ${profile.resumePath} directly in a new tab.

Run "resume" in the terminal anytime for these details again.`

const CHEATSHEET = `KALI PORTFOLIO — TERMINAL CHEAT SHEET (simulated)
=================================================

Navigation & files   pwd, ls, cd, cat, tree
System info          neofetch, uname -a, uptime, free, df, ps, top,
                     id, hostname, date, ip addr, ping <host>
Manuals              man <command>
Session tools        history, echo, clear (or Ctrl+L), exit

Portfolio            about, projects, skills, contact, social,
                     resume, open <project>

See "help" for the full grouped list.`

const OS_RELEASE = `PRETTY_NAME="Kali GNU/Linux Portfolio OS (simulated web edition)"
NAME="Kali Portfolio OS"
ID=kali
VERSION="2026.1"
BUILD_URL="https://github.com/oussamatght"
DE="OussamaWM (React)"`

const MOTD = `Welcome to Oussama OS (portfolio simulation).
Type "help" in the terminal for available commands.`

const PORTFOLIO_LOG = `[boot] desktop session started (simulated)
[boot] wallpaper loaded: neon dragon brandscape
[session] taskbar ready
[session] portfolio workspace active`

const INDEX_HTML = `<!doctype html>
<html>
  <body>
    <h1>oussama@linux</h1>
    <p>Simulated web root — the real portfolio is the desktop UI itself.</p>
  </body>
</html>`

const projectFileContent = (name: string, project: Project): string => {
  const lower = name.toLowerCase()

  if (lower.endsWith('.json')) {
    return JSON.stringify(
      {
        name: project.id,
        private: true,
        version: '1.0.0',
        year: project.year,
        stack: project.stack,
      },
      null,
      2,
    )
  }

  if (lower.includes('readme')) {
    return [
      `# ${project.name}`,
      '',
      project.tagline ?? project.description,
      '',
      project.description,
      '',
      project.stack.length ? `Stack: ${project.stack.join(', ')}` : '',
      project.links?.github ? `Repo: ${project.links.github}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    `${name} — simulated file in ${project.name}`,
    `Path:   ${project.path}/${name}`,
    '',
    project.description,
    project.links?.github ? `\nRepo: ${project.links.github}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

const projectDir = (project: Project): DirNode => {
  const children: Record<string, VfsNode> = {}
  for (const entry of project.files) {
    children[entry.name] =
      entry.kind === 'folder'
        ? dir()
        : file(projectFileContent(entry.name, project))
  }
  return dir(children)
}

const ROOT: DirNode = dir({
  etc: dir({
    'os-release': file(OS_RELEASE),
    hostname: file(`${profile.hostname}\n`),
    motd: file(MOTD),
  }),
  home: dir({
    kali: dir({
      Desktop: dir({}),
      Documents: dir({
        'resume.txt': file(RESUME_TXT),
        'kali-cheatsheet.txt': file(CHEATSHEET),
      }),
      Downloads: dir({}),
      Featured: dir({}),
      'readme.txt': file(HOME_README),
      projects: dir(
        Object.fromEntries(
          projects.map((project) => [project.id, projectDir(project)]),
        ),
      ),
    }),
  }),
  opt: dir({}),
  tmp: dir({}),
  usr: dir({
    local: dir({
      bin: dir({}),
      share: dir({
        'oussama.txt': file(
          'Portfolio workspace hand-built with React + TypeScript + Tailwind CSS.',
        ),
      }),
    }),
  }),
  var: dir({
    log: dir({ 'portfolio.log': file(PORTFOLIO_LOG) }),
    www: dir({ html: dir({ 'index.html': file(INDEX_HTML) }) }),
  }),
})

const splitPath = (value: string): string[] =>
  value.split('/').filter((part) => part.length > 0)

export function getNode(absolutePath: string): VfsNode | null {
  let node: VfsNode = ROOT
  for (const part of splitPath(absolutePath)) {
    if (node.kind !== 'dir') return null
    const next: VfsNode | undefined = node.children[part]
    if (!next) return null
    node = next
  }
  return node
}

export function resolvePath(cwd: string, target: string): string | null {
  const value = target.trim()
  let tokens: string[]

  if (value === '~') {
    tokens = splitPath(HOME)
  } else if (value.startsWith('~/')) {
    tokens = [...splitPath(HOME), ...splitPath(value.slice(2))]
  } else if (value.startsWith('/')) {
    tokens = splitPath(value)
  } else {
    tokens = [...splitPath(cwd), ...splitPath(value)]
  }

  const stack: string[] = []
  for (const token of tokens) {
    if (token === '.') continue
    if (token === '..') {
      stack.pop()
      continue
    }
    stack.push(token)
  }

  const path = `/${stack.join('/')}`
  return getNode(path) ? path : null
}

export function nodeFor(cwd: string, target: string): VfsNode | null {
  const path = resolvePath(cwd, target)
  return path ? getNode(path) : null
}

export function listEntries(path: string): VfsEntry[] {
  const node = getNode(path)
  if (!node || node.kind !== 'dir') return []
  return Object.entries(node.children)
    .map(([name, child]) => ({ name, kind: child.kind }))
    .sort((a, b) =>
      a.kind === b.kind
        ? a.name.localeCompare(b.name)
        : a.kind === 'dir'
          ? -1
          : 1,
    )
}

export function treeLines(rootPath: string): string[] | null {
  const node = getNode(rootPath)
  if (!node || node.kind !== 'dir') return null

  const lines: string[] = [rootPath]
  let directories = 0
  let files = 0

  const walk = (parent: DirNode, prefix: string) => {
    const sorted = Object.entries(parent.children)
      .map(([name, child]) => ({ name, kind: child.kind }))
      .sort((a, b) =>
        a.kind === b.kind
          ? a.name.localeCompare(b.name)
          : a.kind === 'dir'
            ? -1
            : 1,
      )

    sorted.forEach((entry, index) => {
      const isLast = index === sorted.length - 1
      const branch = isLast ? '└── ' : '├── '
      lines.push(`${prefix}${branch}${entry.kind === 'dir' ? `${entry.name}/` : entry.name}`)

      if (entry.kind === 'dir') {
        directories += 1
        const child = parent.children[entry.name] as DirNode
        walk(child, `${prefix}${isLast ? '    ' : '│   '}`)
      } else {
        files += 1
      }
    })
  }

  walk(node, '')

  if (directories > 0 || files > 0) {
    lines.push(
      '',
      `${directories} ${
        directories === 1 ? 'directory' : 'directories'
      }, ${files} ${files === 1 ? 'file' : 'files'}`,
    )
  }

  return lines
}

export function displayPath(cwd: string): string {
  if (cwd === HOME) return '~'
  return cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd
}
