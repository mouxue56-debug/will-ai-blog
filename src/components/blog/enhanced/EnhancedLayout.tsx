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

      {/* Global styles */}
      <style jsx global>{`
        .enhanced-article {
          background: #0A1420;
          color: #E8F4F8;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          line-height: 1.7;
        }

        /* Hero */
        .enhanced-hero {
          background: linear-gradient(135deg, #0A1420 0%, #0D1F35 50%, #0A1420 100%);
          border-bottom: 1px solid rgba(0,212,255,0.2);
          padding: 80px 20px 60px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .enhanced-hero-bg {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 50%, rgba(0,212,255,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 50%, rgba(255,140,66,0.04) 0%, transparent 60%);
          animation: heroPulse 8s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes heroPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .enhanced-hero-content {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }

        .enhanced-hero-eyebrow {
          display: inline-block;
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.3);
          color: #00D4FF;
          padding: 5px 16px;
          border-radius: 20px;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .enhanced-hero-title {
          font-size: 2.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00D4FF 0%, #FFFFFF 50%, #FF8C42 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .enhanced-hero-subtitle {
          color: rgba(232,244,248,0.7);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto 32px;
        }

        .enhanced-hero-date {
          color: rgba(232,244,248,0.4);
          font-size: 13px;
        }

        .enhanced-hero-tags {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .enhanced-hero-tag {
          background: rgba(255,140,66,0.1);
          border: 1px solid rgba(255,140,66,0.3);
          color: #FF8C42;
          padding: 3px 12px;
          border-radius: 12px;
          font-size: 12px;
        }

        /* Stats Bar */
        .enhanced-stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1px;
          background: rgba(0,212,255,0.1);
          border-bottom: 1px solid rgba(0,212,255,0.15);
        }

        .enhanced-stat-item {
          background: #0A1420;
          padding: 24px 20px;
          text-align: center;
        }

        .enhanced-stat-num {
          font-size: 2.2rem;
          font-weight: 700;
          color: #00D4FF;
          margin-bottom: 4px;
        }

        .enhanced-stat-label {
          font-size: 12px;
          color: rgba(232,244,248,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Content Wrapper */
        .enhanced-content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        /* Typography */
        .enhanced-article h1 {
          background: linear-gradient(135deg, #00D4FF 0%, #5EF0C8 50%, #00A8E8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .enhanced-article h2 {
          color: #00D4FF;
          border-left: 3px solid #00D4FF;
          padding-left: 1rem;
          margin: 2.5rem 0 1rem 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .enhanced-article h3 {
          color: #5EF0C8;
          margin: 2rem 0 0.8rem 0;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .enhanced-article p {
          line-height: 1.8;
          margin-bottom: 1.2rem;
          font-size: 1.05rem;
          color: #E8F4F8;
        }

        .enhanced-article a {
          color: #00D4FF;
          text-decoration: none;
          transition: all 0.2s;
        }

        .enhanced-article a:hover {
          text-decoration: underline;
          color: #5EF0C8;
        }

        .enhanced-article blockquote {
          border-left: 4px solid #FF8C42;
          padding: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: rgba(232,244,248,0.8);
          background: rgba(255,140,66,0.05);
          border-radius: 0 8px 8px 0;
        }

        .enhanced-article code {
          background: rgba(0,212,255,0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 0.9em;
          color: #5EF0C8;
        }

        .enhanced-article pre {
          background: rgba(0,0,0,0.3);
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid rgba(0,212,255,0.2);
        }

        .enhanced-article pre code {
          background: transparent;
          padding: 0;
          color: #E8F4F8;
        }

        .enhanced-article ul, .enhanced-article ol {
          margin: 1rem 0 1rem 1.5rem;
        }

        .enhanced-article li {
          margin-bottom: 0.5rem;
        }

        .enhanced-article table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }

        .enhanced-article th {
          background: rgba(0,212,255,0.15);
          color: #00D4FF;
          padding: 0.8rem 1rem;
          text-align: left;
          border: 1px solid rgba(0,212,255,0.2);
        }

        .enhanced-article td {
          padding: 0.8rem 1rem;
          border: 1px solid rgba(0,212,255,0.1);
        }

        .enhanced-article tr:nth-child(even) {
          background: rgba(0,212,255,0.03);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .enhanced-hero-title {
            font-size: 1.8rem;
          }
          .enhanced-hero {
            padding: 60px 16px 40px;
          }
          .enhanced-content-wrapper {
            padding: 40px 16px;
          }
          .enhanced-stat-num {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
