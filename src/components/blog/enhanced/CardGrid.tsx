'use client';

interface Card {
  icon: string;
  name: string;
  description: string;
  tag?: string;
}

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-[rgba(0,212,255,0.04)] backdrop-blur-xl border border-[rgba(0,212,255,0.18)] rounded-[14px] p-5 transition-all duration-300 hover:border-[rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.07)]"
        >
          <div className="text-[28px] mb-3">{card.icon}</div>
          <div className="text-[#00D4FF] font-bold text-[15px] mb-1.5">{card.name}</div>
          <div className="text-[rgba(232,244,248,0.65)] text-[13px] leading-relaxed">{card.description}</div>
          {card.tag && (
            <div className="inline-block mt-2.5 bg-[rgba(255,140,66,0.12)] border border-[rgba(255,140,66,0.3)] text-[#FF8C42] px-2.5 py-0.5 rounded-[10px] text-[11px]">
              {card.tag}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
