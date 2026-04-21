'use client';

import { useEffect, useState } from 'react';

interface Section {
  id: string;
  title: string;
}

export function StickyNav({ sections }: { sections: Section[] }) {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);

      // Find active section
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  return (
    <div
      className={`sticky-nav ${visible ? 'visible' : ''}`}
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
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }}
    >
      <div
        style={{
          color: '#00D4FF',
          fontSize: '11px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0,212,255,0.1)',
        }}
      >
        目录
      </div>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`sticky-nav-item ${activeId === section.id ? 'active' : ''}`}
          style={{
            display: 'block',
            padding: '6px 8px',
            color: activeId === section.id ? '#00D4FF' : 'rgba(232,244,248,0.5)',
            fontSize: '12px',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'all 0.2s',
            marginBottom: '2px',
            borderLeft: `2px solid ${activeId === section.id ? '#00D4FF' : 'transparent'}`,
            background: activeId === section.id ? 'rgba(0,212,255,0.08)' : 'transparent',
            fontWeight: activeId === section.id ? 600 : 400,
          }}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {section.title}
        </a>
      ))}
    </div>
  );
}
