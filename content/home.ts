// All text on the home page. Edit here; app/page.tsx and components/home-actions.tsx only render it.

export const homeContent = {
  badge: 'Now live: tasks, auth and email verification',

  title: {
    line: 'Organize your work,',
    highlight: 'Secure by Design', // shown on the second line in the green gradient
  },

  description:
    'A full-stack app built with NestJS and Next.js. Sign up, verify your email and manage your tasks, with rotating JWT sessions protecting every request.',

  highlights: [
    { value: 'JWT', label: 'Rotating sessions' },
    { value: '24h', label: 'Email links' },
    { value: '3', label: 'Task states' },
  ],

  actions: {
    guest: {
      primary: { label: 'Create an account', href: '/register' },
      secondary: { label: 'Log in', href: '/login' },
    },
    member: {
      primary: { label: 'Go to dashboard', href: '/dashboard' },
      loggedInAs: 'Logged in as', // followed by the user's name
    },
  },

  // Decorative card on the right (wide screens only)
  preview: {
    title: "Today's tasks",
    floatingTag: '✓ Task completed',
    tasks: [
      { title: 'Design the landing page', priority: 'High', done: true },
      { title: 'Write API docs for /tasks', priority: 'Medium', done: false },
      { title: 'Deploy to Vercel', priority: 'High', done: false },
    ],
  },
} as const;
