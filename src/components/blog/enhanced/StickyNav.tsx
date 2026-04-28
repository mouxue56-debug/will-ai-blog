'use client';

import { useEffect, useState, useCallback } from 'react';

interface Section {
  id: string;
  title: string;
}

export function StickyNav({ sections }: { sections: Section[] }) {
  const [visible, setVisible]     = useState(false);
  const [activeId, setActiveId]   = useState('');
  const [isMobile, setIsMobile]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160 && rect.bottom >= 160) {
          setActiveId(section.id);
          break;
        }
      }
    }
  }, [sections]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setDrawerOpen(false);
  };

  const activeSection = sections.find(s => s.id === activeId);

  if (!visible || sections.length === 0) return null;

  /* ── Mobile: bottom pill + drawer ─────────────────────── */
  if (isMobile) {
    return (
      <>
        {/* Drawer backdrop */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 1100,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* Drawer panel */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: drawerOpen ? 0 : '-100%',
            zIndex: 1200,
            background: 'rgba(10,18,30,0.98)',
            borderTop: '1px solid rgba(0,212,255,0.18)',
            borderRadius: '20px 20px 0 0',
            padding: '20px 20px 40px',
            transition: 'bottom 0.35s cubic-bezier(0.22,1,0.36,1)',
            backdropFilter: 'blur(20px)',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {/* Drawer handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '4px', borderRadius: '2px',
              background: 'rgba(0,212,255,0.3)',
            }} />
          </div>

          <div style={{
            fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
            color: '#00D4FF', marginBottom: '14px', paddingBottom: '10px',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
          }}>
            目录
          </div>

          {sections.map((section, i) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                onClick={() => jumpTo(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 10px',
                  marginBottom: '2px',
                  background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? '#00D4FF' : 'transparent'}`,
                  borderRadius: '0 8px 8px 0',
                  color: isActive ? '#00D4FF' : 'rgba(232,244,248,0.6)',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: isActive ? '#FF8C42' : 'rgba(232,244,248,0.3)',
                  minWidth: '20px',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Bottom pill */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(10,20,32,0.92)',
            border: '1px solid rgba(0,212,255,0.28)',
            borderRadius: '24px',
            padding: '10px 18px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            maxWidth: 'calc(100vw - 48px)',
          }}
        >
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
            {sections.map((s) => (
              <div
                key={s.id}
                style={{
                  width: s.id === activeId ? '14px' : '4px',
                  height: '4px',
                  borderRadius: '2px',
                  background: s.id === activeId ? '#00D4FF' : 'rgba(0,212,255,0.25)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Current chapter name */}
          <span style={{
            color: '#E8F4F8',
            fontSize: '12px',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}>
            {activeSection?.title ?? '目录'}
          </span>

          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{
              flexShrink: 0,
              transform: drawerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <path
              d="M2 4L6 8L10 4" stroke="#00D4FF" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      </>
    );
  }

  /* ── Desktop: right-side floating panel ───────────────── */
  return (
    <div
      className="sticky-nav"
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        background: 'rgba(10,20,32,0.95)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '12px',
        padding: '16px 12px',
        width: '180px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'opacity 0.3s',
      }}
    >
      <div style={{
        color: '#00D4FF',
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}>
        目录
      </div>

      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            style={{
              display: 'block',
              padding: '6px 8px',
              color: isActive ? '#00D4FF' : 'rgba(232,244,248,0.48)',
              fontSize: '12px',
              textDecoration: 'none',
              borderRadius: '6px',
              marginBottom: '2px',
              borderLeft: `2px solid ${isActive ? '#00D4FF' : 'transparent'}`,
              background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {section.title}
          </a>
        );
      })}
    </div>
  );
}
