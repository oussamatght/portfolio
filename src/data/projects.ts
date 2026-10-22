export type ProjectFile = {
  name: string
  kind: 'folder' | 'file'
  size?: string
}

export type ProjectLinks = {
  github?: string
  live?: string
  playStore?: string
  appStore?: string
  apk?: string
}

export type Project = {
  id: string
  name: string
  path: string
  description: string
  year: string
  stack: string[]
  tags: string[]
  image: string
  accent: string
  files: ProjectFile[]
  /** Optional extras — existing UI keeps working without them. */
  tagline?: string
  badge?: string
  highlights?: string[]
  links?: ProjectLinks
  /** true when the source repository is private */
  privateRepo?: boolean
}

const GH = 'https://github.com/oussamatght'

export const projects: Project[] = [
  {
    id: 'wassla',
    name: 'WASSLA',
    path: '/home/kali/projects/wassla',
    tagline: 'Full-Stack Marketplace & Delivery Platform',
    description:
      'Real-world marketplace and delivery platform connecting customers, sellers, drivers and service providers, live on Android and iOS.',
    year: '2026', // TODO: set the real year
    stack: ['React Native', 'Expo', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Firebase', 'Cloudinary'],
    tags: ['mobile', 'fullstack', 'realtime', 'payments', 'production'],
    image: '/projects/wassla.webp',
    accent: '#22d3ee',
    badge: 'Live on Google Play & App Store',
    highlights: ['Real-time tracking', 'Payment integration', 'REST APIs', 'Multi-role: customer / seller / driver'],
    privateRepo: true,
    links: {
      // TODO: paste your real store links
      playStore: '',
      appStore: '',
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'server', kind: 'folder' },
      { name: 'shared', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '4 KB' },
      { name: 'app.json', kind: 'file', size: '2 KB' },
      { name: 'package.json', kind: 'file', size: '3 KB' },
    ],
  },
  {
    id: 'web-admin-wassel',
    name: 'Wassel Admin Dashboard',
    path: '/home/kali/projects/web-admin-wassel',
    tagline: 'Admin console for the Wassel marketplace',
    description:
      'Modern admin dashboard to manage users, orders, deliveries and services of the Wassel marketplace platform.',
    year: '2026', // TODO
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Zustand', 'TanStack Query', 'Socket.io', 'Zod'],
    tags: ['web', 'dashboard', 'realtime', 'fullstack'],
    image: '/projects/web-admin-wassel.webp',
    accent: '#60a5fa',
    links: { github: `${GH}/web-admin-wassel` },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'store', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'tsconfig.json', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'oussama-ai-agent',
    name: 'Oussama AI Agent',
    path: '/home/kali/projects/oussama-ai-agent',
    tagline: 'AI-Powered Full-Stack Assistant Platform',
    description:
      'AI agent platform built with Next.js and TypeScript: interactive chat, API automation, smart routing and scalable data handling.',
    year: '2026', // TODO
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'MongoDB'],
    tags: ['ai', 'fullstack', 'chat', 'automation'],
    image: '/projects/oussama-ai-agent.webp',
    accent: '#a78bfa',
    highlights: ['AI agents', 'API automation', 'Interactive chat', 'Responsive UI'],
    links: {
      github: `${GH}/oussama-ai-agent-frontend`,
      live: '', // TODO: live demo URL
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'lib', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'tailwind.config.ts', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'code-souls',
    name: 'Code Souls (GDG Hack Frontend)',
    path: '/home/kali/projects/code-souls',
    tagline: '1st Place — GDG Hackathon',
    description:
      'Gamified frontend learning platform: lessons, practice, stages, multiplayer challenges, boss battles and an in-game store.',
    year: '2026', // TODO
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'JWT', 'Vercel'],
    tags: ['education', 'gamification', 'multiplayer', 'fullstack'],
    image: '/projects/code-souls.webp',
    accent: '#facc15',
    badge: '🥇 1st Place — GDG Hackathon',
    highlights: ['Lesson → Practice → Progress → Unlock → Boss → Reward', 'Multiplayer', 'AI chatbot'],
    links: {
      github: `${GH}/Code-Souls-FRONTEND-`,
      live: '', // TODO: live demo URL
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'stages', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '4 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'next.config.ts', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'chouf-price-dz',
    name: 'ChoufPrice DZ',
    path: '/home/kali/projects/chouf-price-dz',
    tagline: 'Live Price Monitoring Platform for Algeria',
    description:
      'Community-driven platform to monitor, compare and share product prices across all 58 wilayas, with an interactive price map and alerts.',
    year: '2026', // TODO
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'shadcn/ui', 'Radix UI', 'React Hook Form', 'Zod', 'JWT'],
    tags: ['fullstack', 'maps', 'community', 'dashboard'],
    image: '/projects/chouf-price-dz.webp',
    accent: '#34d399',
    highlights: [
      '58 wilayas',
      '300+ products',
      '54,900+ price reports',
      'Interactive price map',
      'Price alerts, chat, voting & statistics',
    ],
    links: {
      github: '', // TODO: repo URL
      live: '', // TODO: live demo URL
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'lib', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '4 KB' },
      { name: 'package.json', kind: 'file', size: '3 KB' },
      { name: 'components.json', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'gcl-hub',
    name: 'GCL Hub',
    path: '/home/kali/projects/gcl-hub',
    tagline: 'GDG Club & Event Management Platform',
    description:
      'Platform for GDG communities: discover events, join clubs, post in the community and get AI-powered assistance.',
    year: '2026', // TODO
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Crew AI', 'Axios', 'Vercel', 'Render'],
    tags: ['fullstack', 'community', 'ai', 'events'],
    image: '/projects/gcl-hub.webp',
    accent: '#f97316',
    badge: '🥇 Best Development Team — GDG Competition',
    highlights: ['Events', 'Clubs', 'Posts', 'Community', 'AI assistant'],
    links: {
      github: '', // TODO: repo URL
      live: '', // TODO: live demo URL
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'services', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'tsconfig.json', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'sakinah',
    name: 'Sakinah — سكينة',
    path: '/home/kali/projects/sakinah',
    tagline: 'Arabic-First Islamic Mobile App',
    description:
      'Free, open-source, privacy-first Islamic companion: Quran, prayer times, Qibla, Hadith, Adhkar and Tasbih. Offline-first, no ads, no accounts.',
    year: '2026', // TODO
    stack: ['React Native', 'Expo', 'Expo Router', 'TypeScript', 'SQLite', 'AsyncStorage', 'TanStack Query', 'EAS Build'],
    tags: ['mobile', 'offline-first', 'rtl', 'open-source'],
    image: '/projects/sakinah.webp',
    accent: '#2dd4bf',
    highlights: [
      'Full Quran (114 surahs) + Tafsir',
      'Prayer times + Adhan notifications',
      'Live Qibla compass',
      'Hadith, Adhkar & Tasbih',
      'Offline-first · RTL-first',
    ],
    links: {
      github: `${GH}/Sakinah-App`,
      apk: '', // TODO: APK download link
    },
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'db', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '5 KB' },
      { name: 'app.json', kind: 'file', size: '2 KB' },
      { name: 'eas.json', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'sakinah-web',
    name: 'Sakinah Web Plugin',
    path: '/home/kali/projects/sakinah-web',
    tagline: 'Web Companion for the Sakinah Ecosystem',
    description:
      'Arabic-first responsive website presenting Sakinah features, with APK download and QR install flow, Islamic library overview and full RTL support.',
    year: '2026',
    stack: ['React', 'TypeScript', 'TanStack Start', 'TanStack Router', 'Vite', 'Nitro', 'Vercel'],
    tags: ['web', 'rtl', 'landing', 'open-source'],
    image: '/projects/sakinah-web.webp',
    accent: '#38bdf8',
    links: {
      github: `${GH}/sakinah-plugin-website`,
      live: '', // TODO: live demo URL
    },
    files: [
      { name: 'src', kind: 'folder' },
      { name: 'public', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'vite.config.ts', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'n8n-automations',
    name: 'n8n Automations',
    path: '/home/kali/projects/n8n-automations',
    tagline: 'From beginner workflows to AI agents',
    description:
      'Collection of practical n8n automation projects: beginner workflows, advanced AI agents, RAG, APIs, databases and business automation.',
    year: '2026', // TODO
    stack: ['n8n', 'AI Agents', 'RAG', 'REST APIs', 'Databases'],
    tags: ['automation', 'ai', 'devops'],
    image: '/projects/n8n-automations.webp',
    accent: '#fb7185',
    links: { github: `${GH}/n8n-automations` },
    files: [
      { name: 'beginner', kind: 'folder' },
      { name: 'ai-agents', kind: 'folder' },
      { name: 'rag', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
    ],
  },
  {
    id: 'web-dev-slides',
    name: 'Web Development Slides',
    path: '/home/kali/projects/web-dev-slides',
    tagline: 'Interactive educational resources',
    description:
      'Growing collection of visual presentations and practical materials for teaching modern web development: HTML → CSS → JS → React → Git & GitHub.',
    year: '2026', // TODO
    stack: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'SVG'],
    tags: ['education', 'workshops', 'open-source'],
    image: '/projects/web-dev-slides.webp',
    accent: '#c084fc',
    links: {
      github: '', // TODO: repo URL
    },
    files: [
      { name: 'html', kind: 'folder' },
      { name: 'css', kind: 'folder' },
      { name: 'javascript', kind: 'folder' },
      { name: 'react', kind: 'folder' },
      { name: 'git-github', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '2 KB' },
    ],
  },
]

export const projectById = (id: string) => projects.find((project) => project.id === id)

export const projectsByTag = (tag: string) => projects.filter((project) => project.tags.includes(tag))