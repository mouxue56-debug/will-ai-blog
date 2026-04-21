'use client';

interface TocItem {
  num: string;
  text: string;
}

interface TocProps {
  items: TocItem[];
}

export function Toc({ items }: TocProps) {
  return (
    <div className="my-10 mx-auto max-w-[900px] bg-[#0D1825] border border-[rgba(0,212,255,0.12)] rounded-2xl p-7">
      <div className="text-[#00D4FF] text-[13px] tracking-[2px] uppercase mb-4">
        📑 目录
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-8">
        {items.map((item, i) => (
          <div 
            key={i} 
            className="flex items-baseline gap-2.5 py-1.5 border-b border-[rgba(255,255,255,0.04)] cursor-pointer hover:text-[#00D4FF] transition-colors"
          >
            <span className="text-[#FF8C42] font-bold text-[13px] min-w-[20px]">{item.num}</span>
            <span className="text-[rgba(232,244,248,0.8)] text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
