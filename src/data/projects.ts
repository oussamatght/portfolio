export type ProjectFile = {
  name: string
  kind: 'folder' | 'file'
  size?: string
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
}

export const projects: Project[] = [
  {
    id: 'event-platform',
    name: 'Event Platform',
    path: '/home/kali/projects/event-platform',
    description:
      'Real-time event booking platform with seat maps, QR ticketing and live attendance analytics.',
    year: '2025',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    tags: ['fullstack', 'realtime', 'payments'],
    image: '/projects/event-platform.webp',
    accent: '#22d3ee',
    files: [
      { name: 'src', kind: 'folder' },
      { name: 'api', kind: 'folder' },
      { name: 'components', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '4 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'docker-compose.yml', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'delivery-app',
    name: 'Delivery App',
    path: '/home/kali/projects/delivery-app',
    description:
      'On-demand delivery platform with live courier tracking, route optimisation and dynamic ETAs.',
    year: '2024',
    stack: ['React Native', 'Express', 'MongoDB', 'Mapbox'],
    tags: ['mobile', 'maps', 'realtime'],
    image: '/projects/delivery-app.webp',
    accent: '#a3e635',
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'server', kind: 'folder' },
      { name: 'shared', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '3 KB' },
      { name: 'app.json', kind: 'file', size: '1 KB' },
      { name: 'tsconfig.json', kind: 'file', size: '1 KB' },
    ],
  },
  {
    id: 'book-store',
    name: 'Book Store',
    path: '/home/kali/projects/book-store',
    description:
      'Full-stack bookstore with catalogue search, cart, order history and an admin inventory console.',
    year: '2024',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    tags: ['fullstack', 'ecommerce', 'cms'],
    image: '/projects/book-store.webp',
    accent: '#f472b6',
    files: [
      { name: 'app', kind: 'folder' },
      { name: 'pages', kind: 'folder' },
      { name: 'prisma', kind: 'folder' },
      { name: 'README.md', kind: 'file', size: '2 KB' },
      { name: 'package.json', kind: 'file', size: '2 KB' },
      { name: 'schema.prisma', kind: 'file', size: '3 KB' },
    ],
  },
]

export const projectById = (id: string) => projects.find((project) => project.id === id)
