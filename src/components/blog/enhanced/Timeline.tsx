'use client';

interface TimelineItem {
  date: string;
  title: string;
  body: string;
  done?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="py-5">
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#00D4FF] to-[#FF8C42]" />
        
        {items.map((item, i) => (
          <div key={i} className="relative py-3.5">
            {/* Dot */}
            <div 
              className={`absolute left-[-29px] top-5 w-3 h-3 rounded-full bg-[#0A1420] border-2 border-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.4)] ${item.done ? 'bg-[#00D4FF]' : ''}`}
            />
            
            <div className="text-[#00D4FF] font-bold text-[13px]">{item.date}</div>
            <div className="text-[#E8F4F8] font-semibold my-1 text-[15px]">{item.title}</div>
            <div className="text-[rgba(232,244,248,0.7)] text-sm leading-relaxed">{item.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}