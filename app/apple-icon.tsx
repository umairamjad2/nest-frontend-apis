import { ImageResponse } from 'next/og';

// Home-screen icon for iPhones and iPads (they don't use SVG icons).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3ecf8e, #2f8f63)',
        }}
      >
        <svg width="110" height="110" viewBox="0 0 64 64">
          <path
            d="M14 33.5l11 11L50 21"
            fill="none"
            stroke="#0b0b0c"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
