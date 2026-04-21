'use client';

import { ReactNode } from 'react';

interface BeforeAfterProps {
  before: {
    title: string;
    items: string[];
  };
  after: {
    title: string;
    items: string[];
  };
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
      <div className="bg-[#0D1825] border border-[rgba(0,212,255,0.1)] rounded-xl p-6 relative border-l-[3px] border-l-[#FF8C42]">
        <div className="absolute -top-[1px] right-5 px-3 py-1 rounded-b-lg bg-[rgba(255,140,66,0.15)] text-[#FF8C42] text-[11px] font-bold">
          ❌ {before.title}
        </div>
        <h4 className="text-[#FF8C42] font-bold mb-3 mt-2">{before.title}</h4>
        {before.items.map((item, i) => (
          <div key={i} className="flex gap-2 py-1 text-sm text-[rgba(232,244,248,0.75)]">
            <span className="text-[#FF8C42] flex-shrink-0">✗</span>
            {item}
          </div>
        ))}
      </div>
      
      <div className="bg-[#0D1825] border border-[rgba(0,212,255,0.1)] rounded-xl p-6 relative border-l-[3px] border-l-[#4ADE80]">
        <div className="absolute -top-[1px] right-5 px-3 py-1 rounded-b-lg bg-[rgba(74,222,128,0.15)] text-[#4ADE80] text-[11px] font-bold">
          ✓ {after.title}
        </div>
        <h4 className="text-[#4ADE80] font-bold mb-3 mt-2">{after.title}</h4>
        {after.items.map((item, i) => (
          <div key={i} className="flex gap-2 py-1 text-sm text-[rgba(232,244,248,0.75)]">
            <span className="text-[#4ADE80] flex-shrink-0">✓</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
