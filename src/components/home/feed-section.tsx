'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, useInView } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface FeedItem {
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  summary: string;
  slug: string;
}

const feedData: FeedItem[] = [
  {
    title: '用4个AI助手管理日常工作',
    category: 'AI心得',
    categoryColor: 'bg-brand-mint/15 text-brand-mint',
    date: '2026-03-18',
    summary: '如何让四个AI实例各司其职、高效协作，从工作流设计到实际踩坑经验。',
    slug: 'my-ai-workflow',
  },
  {
    title: '春天的サイベリアン换毛季',
    category: '猫咪',
    categoryColor: 'bg-brand-coral/15 text-brand-coral',
    date: '2026-03-15',
    summary: '西伯利亚猫的换毛季养护指南，梳毛技巧和毛球预防。',
    slug: 'siberian-spring-care',
  },
  {
    title: '大阪城公園の桜はもうすぐ',
    category: '生活',
    categoryColor: 'bg-brand-taro/15 text-brand-taro',
    date: '2026-03-12',
    summary: '大阪城公園の桜が咲き始めました。今年のお花見スポットを紹介。',
    slug: 'osaka-sakura-2026',
  },
  {
    title: 'OpenClaw多实例架构踩坑',
    category: '技术笔记',
    categoryColor: 'bg-brand-cyan/15 text-brand-cyan',
    date: '2026-03-10',
    summary: '在同一台Mac Mini上运行多个OpenClaw实例的经验，端口管理和进程守护。',
    slug: 'openclaw-multi-instance',
  },
  {
    title: '医療クリニックのAI導入事例',
    category: '案例',
    categoryColor: 'bg-brand-mango/15 text-brand-mango',
    date: '2026-03-08',
    summary: '大阪市内のクリニックにAI自動化を導入した実例。予約管理から患者対応まで。',
    slug: 'ai-clinic-case',
  },
];

function SpotlightCard({ item, index }: { item: FeedItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <Link href={`/blog/${item.slug}`}>
      <motion.div
        ref={cardRef}
        className="relative flex-shrink-0 w-[300px] sm:w-[340px] rounded-xl border border-border/40 bg-card p-5 cursor-pointer overflow-hidden group"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
      >
        {/* Spotlight effect */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74,222,128,0.08), transparent 60%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-20">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className={`text-xs ${item.categoryColor} border-0`}>
              {item.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {item.date}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-brand-mint transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function FeedSection() {
  const t = useTranslations('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {t('feed_title')}
        </motion.h2>
      </div>

      {/* Horizontal scroll container with fade edges */}
      <div className="scroll-fade-edge">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 px-4 sm:px-[max(1.5rem,calc((100vw-64rem)/2+1.5rem))]">
            {feedData.map((item, i) => (
              <SpotlightCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
