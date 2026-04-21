'use client';

import { ReactNode } from 'react';

interface InsightBoxProps {
  title: string;
  children: ReactNode;
}

export function InsightBox({ title, children }: InsightBoxProps) {
  return (
    <div className="my-5 bg-[rgba(255,140,66,0.06)] border border-[rgba(255,140,66,0.25)] rounded-[14px] p-5">
      <div className="text-[#FF8C42] font-bold text-sm mb-2.5 flex items-center gap-2">
        💡 {title}
      </div>
      <div className="text-[rgba(232,244,248,0.8)] text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
