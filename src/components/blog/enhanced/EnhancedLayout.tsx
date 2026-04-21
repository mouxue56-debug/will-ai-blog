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

        /* TOC */
        .toc {
          background: #0D1825;
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 16px;
          padding: 28px 32px;
          margin: 40px auto;
          max-width: 900px;
        }
        .toc-title {
          color: #00D4FF;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .toc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; }
        .toc-item { display: flex; align-items: baseline; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .toc-num { color: #FF8C42; font-weight: 700; font-size: 13px; min-width: 20px; }
        .toc-text { color: rgba(232,244,248,0.8); font-size: 14px; }
        .toc-item:hover .toc-text { color: #00D4FF; }

        /* Cards */
        .cards-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
        .card {
          background: rgba(0,212,255,0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,212,255,0.18);
          border-radius: 14px;
          padding: 22px 20px;
          transition: all 0.3s;
        }
        .card:hover {
          border-color: rgba(0,212,255,0.4);
          box-shadow: 0 0 30px rgba(0,212,255,0.07);
        }
        .card-icon { font-size: 28px; margin-bottom: 12px; }
        .card-name { color: #00D4FF; font-weight: 700; font-size: 15px; margin-bottom: 6px; }
        .card-desc { color: rgba(232,244,248,0.65); font-size: 13px; line-height: 1.6; }
        .card-tag {
          display: inline-block;
          background: rgba(255,140,66,0.12);
          border: 1px solid rgba(255,140,66,0.3);
          color: #FF8C42;
          padding: 2px 10px;
          border-radius: 10px;
          font-size: 11px;
          margin-top: 10px;
        }

        /* Diagram */
        .diagram {
          background: #0D1825;
          border: 1px solid rgba(0,212,255,0.15);
          border-radius: 16px;
          padding: 32px;
          margin: 24px 0;
          overflow-x: auto;
        }
        .diagram-svg { display: flex; justify-content: center; }
        .diagram-svg svg { max-width: 100%; height: auto; }

        /* Table */
        .table-wrap { margin: 20px 0; overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #0D1825;
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 12px;
          overflow: hidden;
          font-size: 14px;
        }
        th {
          background: rgba(0,212,255,0.1);
          color: #00D4FF;
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid rgba(0,212,255,0.2);
          white-space: nowrap;
        }
        td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background: rgba(0,212,255,0.03); }
        .td-mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; color: #FF8C42; }
        .td-key { color: #FF8C42; font-weight: 600; }
        .td-ok { color: #4ADE80; }

        /* Before/After */
        .before-after {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 24px 0;
        }
        .before-after-col {
          background: #0D1825;
          border: 1px solid rgba(0,212,255,0.1);
          border-radius: 14px;
          padding: 24px;
          position: relative;
        }
        .before-after-col.before { border-left: 3px solid #FF8C42; }
        .before-after-col.after { border-left: 3px solid #4ADE80; }
        .before-after-label {
          position: absolute;
          top: -1px;
          right: 20px;
          padding: 4px 12px;
          border-radius: 0 0 8px 8px;
          font-size: 11px;
          font-weight: 700;
        }
        .before-after-label.before {
          background: rgba(255,140,66,0.15);
          color: #FF8C42;
        }
        .before-after-label.after {
          background: rgba(74,222,128,0.15);
          color: #4ADE80;
        }
        .comparison-item { display: flex; gap: 8px; padding: 5px 0; font-size: 14px; color: rgba(232,244,248,0.75); }
        .comparison-check { color: #4ADE80; flex-shrink: 0; }
        .comparison-cross { color: #FF8C42; flex-shrink: 0; }

        /* Workflow */
        .workflow {
          background: #0D1825;
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 14px;
          padding: 24px;
          margin: 20px 0;
        }
        .workflow-title { color: #00D4FF; font-weight: 700; font-size: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .workflow-step { display: flex; gap: 16px; margin-bottom: 14px; align-items: flex-start; }
        .step-num {
          background: linear-gradient(135deg, #00D4FF, #FF8C42);
          color: #0A1420;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .step-text { color: rgba(232,244,248,0.85); font-size: 14px; flex: 1; }
        .step-text strong { color: #00D4FF; }
        .step-text em { color: #FF8C42; font-style: normal; }

        /* Insight Box */
        .insight-box {
          background: rgba(255,140,66,0.06);
          border: 1px solid rgba(255,140,66,0.25);
          border-radius: 14px;
          padding: 20px 24px;
          margin: 20px 0;
        }
        .insight-title { color: #FF8C42; font-weight: 700; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .insight-body { color: rgba(232,244,248,0.8); font-size: 14px; line-height: 1.8; }

        /* Decision Card */
        .decision-card {
          background: rgba(255,140,66,0.06);
          border: 1px solid rgba(255,140,66,0.2);
          border-left: 3px solid #FF8C42;
          border-radius: 0 12px 12px 0;
          padding: 20px 24px;
          margin: 20px 0;
        }
        .decision-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .decision-badge {
          background: rgba(255,140,66,0.15);
          color: #FF8C42;
          padding: 2px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }
        .decision-title { color: #FF8C42; font-weight: 700; font-size: 14px; }
        .decision-body { color: rgba(232,244,248,0.8); font-size: 14px; line-height: 1.8; }

        /* Terms */
        .terms { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; margin: 20px 0; }
        .term-item { display: flex; align-items: baseline; gap: 8px; }
        .term {
          position: relative;
          color: #FF8C42;
          font-weight: 700;
          cursor: help;
          border-bottom: 1px dashed rgba(255,140,66,0.4);
          font-size: 14px;
          flex-shrink: 0;
        }
        .term::after {
          content: attr(data-tip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10,20,32,0.98);
          border: 1px solid rgba(0,212,255,0.3);
          color: #E8F4F8;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: normal;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.25s;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        }
        .term:hover::after { opacity: 1; visibility: visible; bottom: calc(100% + 8px); }
        .term-def { color: rgba(232,244,248,0.6); font-size: 13px; }

        /* Code */
        pre {
          background: #080F1A;
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 12px;
          padding: 20px 24px;
          overflow-x: auto;
          margin: 16px 0;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 13px;
          line-height: 1.7;
          color: #B8D4E8;
        }
        code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 13px;
          color: #FF8C42;
          background: rgba(255,140,66,0.08);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cards-3 { grid-template-columns: 1fr; }
          .toc-grid { grid-template-columns: 1fr; }
          .before-after { grid-template-columns: 1fr; }
          .terms { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
