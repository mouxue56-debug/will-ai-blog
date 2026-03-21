import { ImageResponse } from 'next/og';

export const runtime = 'edge';
const BRAND_ACCENTS = {
  zh: '#38bdf8',
  ja: '#fb7185',
  en: '#34d399',
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title')?.slice(0, 120) || 'Will AI Blog';
  const langParam = searchParams.get('lang');
  const lang = langParam === 'ja' || langParam === 'en' ? langParam : 'zh';
  const accent = BRAND_ACCENTS[lang];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at top right, ${accent}44 0%, transparent 35%), radial-gradient(circle at bottom left, #38bdf822 0%, transparent 30%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 64,
            width: 180,
            height: 10,
            borderRadius: 999,
            background: accent,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: `2px solid ${accent}`,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '84px 72px 64px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              maxWidth: 930,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 24,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              <span>Will AI Blog</span>
              <span style={{ color: '#94a3b8', letterSpacing: 2 }}>{lang.toUpperCase()}</span>
            </div>
            <div
              style={{
                display: '-webkit-box',
                fontSize: 60,
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: -1.8,
                color: '#f8fafc',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 22, color: '#cbd5e1' }}>willbuilds with AI, product, and daily experiments</div>
              <div style={{ fontSize: 18, color: '#64748b' }}>aiblog.fuluckai.com</div>
            </div>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 28,
                background: `linear-gradient(135deg, ${accent} 0%, #0f172a 100%)`,
                boxShadow: `0 0 80px ${accent}55`,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
