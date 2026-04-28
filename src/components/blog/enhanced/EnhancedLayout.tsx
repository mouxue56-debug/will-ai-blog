'use client';

import { ReactNode } from 'react';
import { ScrollProgressBar, StickyNav, BackToTop } from './index';

interface Section {
  id: string;
  title: string;
}

interface EnhancedLayoutProps {
  children: ReactNode;
  sections?: Section[];
  hero?: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    date?: string;
    tags?: string[];
  };
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

export function EnhancedLayout({ children, sections = [], hero, stats }: EnhancedLayoutProps) {
  return (
    <div className="enhanced-article">
      <ScrollProgressBar />
      {sections.length > 0 && <StickyNav sections={sections} />}
      <BackToTop />

      {/* Hero Section */}
      {hero && (
        <section className="enhanced-hero">
          <div className="enhanced-hero-bg" />
          <div className="enhanced-hero-content">
            {hero.eyebrow && (
              <div className="enhanced-hero-eyebrow">{hero.eyebrow}</div>
            )}
            <h1 className="enhanced-hero-title">{hero.title}</h1>
            {hero.subtitle && (
              <p className="enhanced-hero-subtitle">{hero.subtitle}</p>
            )}
            {hero.date && (
              <div className="enhanced-hero-date">{hero.date}</div>
            )}
            {hero.tags && hero.tags.length > 0 && (
              <div className="enhanced-hero-tags">
                {hero.tags.map((tag, i) => (
                  <span key={i} className="enhanced-hero-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Bar */}
      {stats && stats.length > 0 && (
        <div className="enhanced-stats-bar">
          {stats.map((stat, i) => (
            <div key={i} className="enhanced-stat-item">
              <div className="enhanced-stat-num">{stat.value}</div>
              <div className="enhanced-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="enhanced-content-wrapper">
        {children}
      </div>
    </div>
  );
}
