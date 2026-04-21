'use client';

import { ReactNode } from 'react';
import { ScrollProgressBar, StickyNav, BackToTop } from './index';

interface EnhancedLayoutProps {
  children: ReactNode;
  sections?: Array<{ id: string; title: string }>;
}

export function EnhancedLayout({ children, sections = [] }: EnhancedLayoutProps) {
  return (
    <div className="enhanced-article">
      <ScrollProgressBar />
      {sections.length > 0 && <StickyNav sections={sections} />}
      <BackToTop />
      
      {/* Global styles for enhanced article */}
      <style jsx global>{`
        .enhanced-article {
          background: #0A1420;
          color: #E8F4F8;
          min-height: 100vh;
        }
        
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
        }
        
        .enhanced-article h3 {
          color: #5EF0C8;
          margin: 2rem 0 0.8rem 0;
          font-size: 1.4rem;
        }
        
        .enhanced-article p {
          line-height: 1.8;
          margin-bottom: 1.2rem;
          font-size: 1.05rem;
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
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: rgba(232,244,248,0.8);
          background: rgba(255,140,66,0.05);
          padding: 1.5rem;
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
      `}</style>
      
      {children}
    </div>
  );
}
