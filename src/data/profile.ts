export const profile = {
  name: 'Oussama',
  fullName: 'Taright Oussama',
  role: 'FULL STACK DEVELOPER & INSTRUCTOR',
  user: 'kali',
  hostname: 'kali-portfolio',
  github: 'https://github.com/oussamatght',
  githubUser: 'oussamatght',
  linkedin: 'https://www.linkedin.com/in/taright-oussama',
  emailHref: 'mailto:oussamatght6@gmail.com',
  emailLabel: 'oussamatght6@gmail.com',
  resumePath: '/oussamaCV.pdf',
  resumeFileName: 'Oussama-CV.pdf',
} as const

export const aboutInfo = {
  education: 'Computer Science Student @ USTHB',
  tagline:
    'I build full-stack web and mobile applications with a focus on clean architecture, practical solutions, scalable systems and polished user experiences.',
  techStack: [
    {
      label: 'Frontend',
      items: ['React', 'Next.js', 'TypeScript', 'React Native', 'Tailwind CSS'],
    },
    {
      label: 'Backend',
      items: ['Node.js', 'Express.js', 'NestJS', 'REST APIs'],
    },
    {
      label: 'Databases & storage',
      items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
    },
    {
      label: 'Currently learning',
      items: ['Docker', 'Linux', 'AWS', 'DevOps', 'AI Integration', 'LLMs', 'RAG', 'n8n'],
    },
    {
      label: 'Interests',
      items: [
        'Clean Architecture',
        'Scalable Applications',
        'Developer Tools',
        'AI-Powered Products',
        'EdTech',
      ],
    },
  ],
} as const

export const instructorExperience = [
  {
    org: 'Mastech Academy',
    title: 'Formateur en Développement Full Stack',
    period: 'Avr. 2026 – Mai 2026 · Part-time · Remote (Alger)',
    points: [
      'Taught Full Stack Web Development: React, Next.js, Node.js, Express.js, MongoDB, PostgreSQL',
      'Delivered practical workshops and project-based training',
      'Mentored students building responsive web applications and REST APIs',
      'Assisted students with debugging, deployment and development best practices',
      'Evaluated projects and provided technical feedback',
    ],
  },
  {
    org: 'Micro Club & Royal School',
    title: 'Instructor — Full Stack, Python & more',
    period: 'Workshops & training courses',
    points: [
      'Taught Full Stack web development track',
      'Python and other programming languages',
    ],
  },
] as const
