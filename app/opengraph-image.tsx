import { ImageResponse } from 'next/og';
import { siteName } from '@/content/navigation';

// The preview card shown when a link to the site is shared (LinkedIn, WhatsApp, X, Slack…).
export const alt = `${siteName}: plan your work, track your tasks and keep your account secure`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const tasks = [
  { title: 'Design the landing page', tag: 'Done', color: '#3fb27f', done: true },
  { title: 'Add refresh-token rotation', tag: 'In progress', color: '#6f7fec', done: false },
  { title: 'Write the README', tag: 'Due tomorrow', color: '#52c48c', done: false },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0b0b0c',
          backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(82,196,140,0.25), transparent 45%)',
          color: '#ececec',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left: brand and headline */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 36, fontWeight: 700 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #3ecf8e, #2f8f63)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 64 64">
                <path d="M14 33.5l11 11L50 21" fill="none" stroke="#0b0b0c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {siteName}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Plan your work.</div>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: '#52c48c' }}>
              Track every task.
            </div>
            <div style={{ marginTop: 24, fontSize: 26, color: '#a1a1aa' }}>
              Full-stack app · NestJS · Next.js · PostgreSQL
            </div>
          </div>
        </div>

        {/* Right: a small task card */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 420,
              padding: 28,
              gap: 14,
              borderRadius: 24,
              background: '#121214',
              border: '1px solid #27272a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 700 }}>
              <span>Today</span>
              <span style={{ color: '#52c48c' }}>33% done</span>
            </div>
            {tasks.map((task) => (
              <div
                key={task.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 16,
                  borderRadius: 14,
                  background: '#1a1a1d',
                  borderLeft: `5px solid ${task.color}`,
                }}
              >
                <span style={{ fontSize: 20, color: task.done ? '#71717a' : '#ececec', textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                <span style={{ fontSize: 15, color: task.color }}>{task.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
