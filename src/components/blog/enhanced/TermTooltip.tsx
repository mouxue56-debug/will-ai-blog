'use client';

interface Term {
  term: string;
  definition: string;
}

interface TermTooltipProps {
  terms: Term[];
}

export function TermTooltip({ terms }: TermTooltipProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-5">
      {terms.map((item, i) => (
        <div key={i} className="flex items-baseline gap-2">
          <span 
            className="relative text-[#FF8C42] font-bold text-sm cursor-help border-b border-dashed border-[rgba(255,140,66,0.4)] group"
          >
            {item.term}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-[rgba(10,20,32,0.98)] border border-[rgba(0,212,255,0.3)] text-[#E8F4F8] px-3.5 py-2.5 rounded-lg text-xs font-normal whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.6)] mb-2">
              {item.definition}
            </span>
          </span>
          <span className="text-[rgba(232,244,248,0.6)] text-[13px]">{item.definition}</span>
        </div>
      ))}
    </div>
  );
}
