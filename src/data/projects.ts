export type ProjectFile = {
  name: string
  kind: 'folder' | 'file'
  size?: string
}

export type ProjectLink = {
  label: string
  url: string
}

export type ProjectLinks = {
  github?: string
  live?: string
  backend?: string
  playStore?: string
  appStore?: string
  apk?: string
  /** Any additional labelled links (e.g. one deployment per slide topic). */
  extra?: ProjectLink[]
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
  /** Optional screenshot gallery (image is the primary shot). */
  gallery?: string[]
  galleryLabels?: string[]
  accent: string
  files: ProjectFile[]
  /** Optional extras — existing UI keeps working without them. */
  tagline?: string
  badge?: string
  highlights?: string[]
  links?: ProjectLinks
  /** true when the source repository is private */
  privateRepo?: boolean
  /** show first / on the desktop highlights */
  featured?: boolean
}

const GH = 'https://github.com/oussamatght'

import aiagentImg from '../assets/projects/aiagent.jpg'
import choufImg from '../assets/projects/chouf-price-dz.jpg'
import chouf2Img from '../assets/projects/chouf-price-dz-2.jpg'
import codeSoulsImg from '../assets/projects/code-souls.jpg'
import gdgImg from '../assets/projects/gdg.jpg'
import n8nImg from '../assets/projects/n8n-automations.jpg'
import nextlevelImg from '../assets/projects/nextlevel.jpg'
import praytimesImg from '../assets/projects/praytimes.jpg'
import sakinahAppImg from '../assets/projects/sakinhaapp.jpg'
import slidesCssImg from '../assets/projects/slides-css.jpg'
import slidesHtmlImg from '../assets/projects/slides-html.jpg'
import slidesInternetImg from '../assets/projects/slides-internet.jpg'
import slidesJsImg from '../assets/projects/slides-javascript.jpg'
import slidesReactImg from '../assets/projects/slides-react.jpg'
import wassla2Img from '../assets/projects/wassla-2.jpg'
import wasslaAppImg from '../assets/projects/wasslaapp.jpg'

const folder = (name: string): ProjectFile => ({ name, kind: 'folder' })
const file = (name: string): ProjectFile => ({ name, kind: 'file' })

export const projects: Project[] = [
  // ───────────────────────────── FEATURED ─────────────────────────────
  {
    id: 'wassla',
    name: 'WASSLA',
    path: '/home/kali/projects/wassla',
    tagline: 'Full-Stack Marketplace & Delivery Platform',
    description:
      'Real-world marketplace and delivery platform connecting customers, sellers, drivers and service providers. Live on Android and iOS.',
    year: '2026',
    stack: ['React Native', 'Expo', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Firebase', 'Cloudinary'],
    tags: ['mobile', 'fullstack', 'realtime', 'payments', 'production'],
    image: wasslaAppImg,
    gallery: [wasslaAppImg, wassla2Img],
    accent: '#22d3ee',
    featured: true,
    badge: 'Live on Google Play & App Store',
    highlights: [
      'Real-time order & driver tracking',
      'Payment integration',
      'Product returns & order management',
      'Auth notifications · i18n',
      'Multi-role: customer / seller / driver',
    ],
    privateRepo: true,
    links: {
      playStore: 'https://play.google.com/store/apps/details?id=com.wassla.dz.app',
      appStore: 'https://apps.apple.com/us/app/wassla-app/id6782409544',
    },
    files: [
      folder('app'),
      folder('assets'),
      folder('components'),
      folder('constants'),
      folder('hooks'),
      folder('i18n'),
      folder('lib'),
      folder('scripts'),
      folder('store'),
      folder('theme'),
      folder('types'),
      file('app.json'),
      file('eas.json'),
      file('package.json'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'web-admin-wassel',
    name: 'Wassel Admin Dashboard',
    path: '/home/kali/projects/web-admin-wassel',
    tagline: 'Admin console for the Wassel marketplace',
    description:
      'Modern admin dashboard to manage users, orders, deliveries and services of the Wassel marketplace platform.',
    year: '2026',
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Zustand', 'TanStack Query', 'Socket.io', 'Zod'],
    tags: ['web', 'dashboard', 'realtime', 'fullstack'],
    image: '/src/assets/projects/wassla-2.jpg',
    accent: '#60a5fa',
    featured: true,
    links: { github: `${GH}/web-admin-wassel` },
    files: [
      folder('app'),
      folder('components'),
      folder('store'),
      folder('lib'),
      file('package.json'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'oussama-ai-agent',
    name: 'Oussama AI Agent',
    path: '/home/kali/projects/oussama-ai-agent',
    tagline: 'AI-Powered Full-Stack Assistant Platform',
    description:
      'Conversational AI assistant with an elegant responsive chat UI, smart routing, API automation and MongoDB persistence, designed as a foundation for intelligent agents.',
    year: '2025',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Render'],
    tags: ['ai', 'fullstack', 'chat', 'automation'],
    image: aiagentImg,
    accent: '#a78bfa',
    featured: true,
    highlights: ['Interactive chat with history', 'Smart routing', 'API automation', 'Clean, scalable architecture'],
    links: {
      github: `${GH}/oussama-ai-agent-frontend`,
      backend: `${GH}/oussama-ai-agent-backend`,
      live: 'https://oussama-ai-agent.onrender.com/',
      extra: [
        { label: 'Live API (backend)', url: 'https://oussama-ai-agent-backend.vercel.app' },
      ],
    },
    files: [
      folder('app'),
      folder('public'),
      file('next.config.ts'),
      file('package.json'),
      file('postcss.config.mjs'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'code-souls',
    name: 'Code Souls (GDG Hack Frontend)',
    path: '/home/kali/projects/code-souls',
    tagline: '1st Place — GDG Hackathon',
    description:
      'Gamified frontend learning platform: lessons, stages, multiplayer challenges, boss battles and an in-game store. Learn → Practice → Progress → Unlock → Challenge → Master.',
    year: '2025',
    stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'JWT', 'REST APIs', 'Vercel'],
    tags: ['education', 'gamification', 'multiplayer', 'fullstack', 'hackathon'],
    image: codeSoulsImg,
    accent: '#facc15',
    featured: true,
    badge: '🥇 1st Place — GDG Hackathon',
    highlights: ['Progression & unlockable stages', 'Boss battles', 'Multiplayer', 'In-game store', 'JWT authentication'],
    links: {
      github: `${GH}/Code-Souls-FRONTEND-`,
      backend: `${GH}/Code-Souls-BACKEND`,
      live: 'https://code-souls-frontend-dmhx.vercel.app/',
    },
    files: [
      folder('app'),
      folder('components'),
      folder('docs'),
      folder('hooks'),
      folder('lib'),
      folder('public'),
      folder('styles'),
      file('components.json'),
      file('next.config.ts'),
      file('package.json'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'chouf-price-dz',
    name: 'ChoufPrice DZ',
    path: '/home/kali/projects/chouf-price-dz',
    tagline: 'Live Price Monitoring Platform for Algeria',
    description:
      'Community-driven platform to monitor, compare and share product prices across all 58 wilayas, with an interactive price map, alerts and real-time chat.',
    year: '2025',
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'shadcn/ui', 'Radix UI', 'React Hook Form', 'Zod', 'JWT'],
    tags: ['fullstack', 'maps', 'community', 'dashboard', 'realtime'],
    image: choufImg,
    gallery: [choufImg, chouf2Img],
    accent: '#34d399',
    featured: true,
    highlights: [
      '58 wilayas · 300+ products',
      '54,900+ price reports on an interactive map',
      'Marker clustering & spiderfy',
      'Price alerts for abnormal changes',
      'Community chat, voting & statistics',
      'FR / AR / EN with RTL',
    ],
    links: {
      github: `${GH}/ChoufPrice-DZ-Platform`,
      live: 'https://chouf-price-dz-platform-kg67.vercel.app/',
      backend: 'https://github.com/oussamatght/ChoufPrice-DZ-Platform-backend',
    },
    files: [
      folder('app'),
      folder('components'),
      folder('context'),
      folder('data'),
      folder('hooks'),
      folder('lib'),
      folder('public'),
      folder('styles'),
      folder('types'),
      file('components.json'),
      file('next.config.mjs'),
      file('package.json'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'gcl-hub',
    name: 'GCL Hub',
    path: '/home/kali/projects/gcl-hub',
    tagline: 'GDG Club & Event Management Platform',
    description:
      'Platform for GDG communities: discover events, join clubs, follow posts and talk to an AI chatbot powered by Crew AI.',
    year: '2025',
    stack: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Crew AI', 'Axios', 'Vercel'],
    tags: ['fullstack', 'community', 'ai', 'events', 'competition'],
    image: gdgImg,
    accent: '#f97316',
    featured: true,
    badge: '🏆 Best Development Team — GDG Competition',
    highlights: ['Events search & registration', 'Club profiles & dashboard', 'Posts & analytics', 'Crew AI chatbot'],
    links: {
      github: `${GH}/club-student-hub`,
      live: 'https://club-student-hub.vercel.app/',
      backend: `${GH}/sys_multi_agents`,
    },
    files: [
      folder('app'),
      folder('components'),
      folder('lib'),
      folder('public'),
      file('components.json'),
      file('next.config.ts'),
      file('package.json'),
      file('tsconfig.json'),
      file('README.md'),
    ],
  },
  {
    id: 'sakinah',
    name: 'Sakinah — سكينة',
    path: '/home/kali/projects/sakinah',
    tagline: 'Arabic-First Islamic Mobile App',
    description:
      'Free, open-source, privacy-first Islamic companion: Quran, prayer times, Qibla, Hadith, Adhkar and Tasbih. Offline-first, RTL-first, no ads and no accounts.',
    year: '2026',
    stack: [
      'React Native',
      'Expo',
      'Expo Router',
      'TypeScript',
      'SQLite',
      'AsyncStorage',
      'TanStack Query',
      'Expo Notifications',
      'Expo Location',
      'Expo Sensors',
      'EAS Build',
    ],
    tags: ['mobile', 'offline-first', 'rtl', 'open-source'],
    image: sakinahAppImg,
    accent: '#2dd4bf',
    featured: true,
    highlights: [
      'Full Quran (114 surahs) + Tafsir',
      'Prayer times + Adhan notifications',
      'Live Qibla compass',
      'Major Hadith collections',
      'Adhkar, Tasbih, Daily Wird & Favorites',
      'Offline-first · no ads · no accounts',
    ],
    links: {
      github: `${GH}/Sakinah-App`,
      apk: 'https://drive.google.com/file/d/1DM0AZ6NB7lZSKehBt7mA0zKl_PRPOpIB',
    },
    files: [folder('app'), file('.gitignore'), file('README.md')],
  },
  {
    id: 'sakinah-web',
    name: 'Sakinah Web Plugin',
    path: '/home/kali/projects/sakinah-web',
    tagline: 'Web Companion for the Sakinah Ecosystem',
    description:
      'Arabic-first responsive website presenting Sakinah: features, Islamic library overview, APK download with QR install flow, install guide and contact page.',
    year: '2026',
    stack: ['React', 'TypeScript', 'TanStack Start', 'TanStack Router', 'Vite', 'Nitro', 'Vercel'],
    tags: ['web', 'rtl', 'landing', 'open-source'],
    image: '/src/assets/projects/sakinhaa.png',
    accent: '#38bdf8',
    featured: true,
    highlights: ['APK download + QR install flow', 'Full RTL support', 'Premium responsive UI/UX'],
    links: {
      github: `${GH}/sakinah-plugin-website`,
      live: 'https://sakinah-plugin-website.vercel.app/',
    },
    files: [
      folder('public'),
      folder('scripts'),
      folder('src'),
      file('components.json'),
      file('package.json'),
      file('tsconfig.json'),
      file('vercel.json'),
      file('vite.config.ts'),
      file('README.md'),
    ],
  },

  // ───────────────────────────── MORE WORK ─────────────────────────────
  {
    id: 'nextlevel',
    name: 'NextLevel',
    path: '/home/kali/projects/nextlevel',
    tagline: 'Full-stack E-Commerce Platform',
    description:
      'E-commerce platform: browse products, manage carts, check out securely with Stripe and administer the catalogue through a Strapi admin. Media on Cloudinary, auth with Clerk.',
    year: '2025',
    stack: ['Next.js', 'Strapi', 'Stripe', 'Clerk', 'Tailwind CSS', 'Cloudinary', 'Render'],
    tags: ['ecommerce', 'fullstack', 'payments', 'cms'],
    image: nextlevelImg,
    accent: '#f472b6',
    highlights: ['Cart (guest + authenticated)', 'Stripe checkout', 'Order history', 'Strapi admin panel'],
    links: {
      github: `${GH}/nextlevel`,
      backend: `${GH}/nextlevel-backend`,
      live: 'https://nextlevel-3-1v3a.onrender.com/',
    },
    files: [
      folder('app'),
      folder('public'),
      file('jsconfig.json'),
      file('next.config.mjs'),
      file('package.json'),
      file('postcss.config.mjs'),
      file('README.md'),
    ],
  },
  {
    id: 'web-dev-slides',
    name: 'Web Development Slides',
    path: '/home/kali/projects/web-dev-slides',
    tagline: 'Interactive educational resources',
    description:
      'Growing collection of interactive presentations and workshop materials for teaching modern web development: HTML, CSS, JavaScript, React, Git & GitHub.',
    year: '2026',
    stack: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'SVG'],
    tags: ['education', 'workshops', 'open-source'],
    image: slidesHtmlImg,
    gallery: [slidesHtmlImg, slidesCssImg, slidesJsImg, slidesReactImg, slidesInternetImg],
    galleryLabels: ['HTML deck', 'CSS deck', 'JavaScript deck', 'React deck', 'Internet deck'],
    accent: '#c084fc',
    highlights: ['One deployed deck per topic', 'Workshop-ready content', 'Opens directly in the browser'],
    links: {
      github: `${GH}/slides`,
      extra: [
        { label: 'HTML slides', url: 'https://slides-zeta-rosy.vercel.app/' },
        { label: 'CSS slides', url: 'https://slides-qgah.vercel.app/' },
        { label: 'JavaScript slides', url: 'https://slides-77ra.vercel.app/' },
        { label: 'React slides', url: 'https://slides-53io.vercel.app/' },
        { label: 'Internet slides', url: 'https://slides-7wua.vercel.app/' },
      ],
    },
    files: [
      folder('css'),
      folder('git'),
      folder('intrent'),
      folder('js'),
      folder('react'),
      folder('slideoop'),
      folder('workshop'),
      file('index.html'),
      file('README.md'),
    ],
  },
  {
    id: 'n8n-automations',
    name: 'n8n Automations',
    path: '/home/kali/projects/n8n-automations',
    tagline: 'From beginner workflows to AI agents',
    description:
      'Collection of practical n8n automation projects: beginner workflows, advanced AI agents, RAG, APIs, databases and business automation.',
    year: '2026',
    stack: ['n8n', 'AI Agents', 'RAG', 'REST APIs', 'Databases'],
    tags: ['automation', 'ai', 'devops'],
    image: n8nImg,
    accent: '#fb7185',
    links: { github: `${GH}/n8n-automations` },
    files: [file('README.md')],
  },
  {
    id: 'praytimes',
    name: 'Prayer Times Web App',
    path: '/home/kali/projects/praytimes',
    tagline: 'Prayer times for all Algerian cities',
    description:
      'Bilingual (Arabic / English) responsive web app with live clock, next-prayer countdown, city selector, dark/light themes and a glassmorphism design, powered by the Aladhan API.',
    year: '2024',
    stack: ['HTML', 'CSS', 'JavaScript', 'Axios', 'Aladhan API'],
    tags: ['web', 'rtl', 'api'],
    image: praytimesImg,
    accent: '#fbbf24',
    links: {
      github: `${GH}/praytimes`,
      live: 'https://praytimes-ztwn.vercel.app/',
    },
    files: [
      file('pray.html'),
      file('pray.css'),
      file('pray.js'),
      file('package.json'),
      file('netlify.toml'),
      file('vercel.json'),
      file('README.md'),
    ],
  },
  {
    id: 'islam-web',
    name: 'Islamic Knowledge Hub',
    path: '/home/kali/projects/islam-web',
    tagline: 'Learn, test and explore Islamic knowledge',
    description:
      'Modern responsive Islamic web platform with an interactive quiz game, educational sections, dark/light theme toggle and saved preferences.',
    year: '2024', 
    stack: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'LocalStorage', 'Render'],
    tags: ['web', 'education', 'quiz'],
    image: '/src/assets/projects/islemweb.png',
    accent: '#4ade80',
    links: {
      github: `${GH}/islam-web`,
      live: 'https://islam-webb.onrender.com/',
    },
    files: [
      file('index.html'),
      file('islam.css'),
      file('islam.js'),
      file('islam.ts'),
      file('Quiz Game.html'),
      file('Quiz Game.css'),
      file('Quiz Game.js'),
      file('Quiz Game.ts'),
      file('README.md'),
    ],
  },
  {
    id: 'leetcode',
    name: 'LeetCode Solutions',
    path: '/home/kali/projects/leetcode',
    tagline: 'Algorithms & data structures practice',
    description:
      'Personal collection of LeetCode solutions in Python, C and TypeScript, organised by language and difficulty.',
    year: '2025',
    stack: ['Python', 'C', 'TypeScript'],
    tags: ['algorithms', 'practice', 'open-source'],
    image: '/projects/leetcode.webp',
    accent: '#fb923c',
    links: { github: `${GH}/LeetCode` },
    files: [folder('c'), folder('python'), folder('Typescript'), file('.gitignore'), file('README.md')],
  },
]

export const projectById = (id: string) => projects.find((project) => project.id === id)

export const projectsByTag = (tag: string) => projects.filter((project) => project.tags.includes(tag))

export const featuredProjects = () => projects.filter((project) => project.featured)
