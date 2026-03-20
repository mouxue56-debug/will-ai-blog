'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion, useInView } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface FeedItem {
  key: string;
  categoryColor: string;
  date: string;
  slug: string;
}

const feedData: FeedItem[] = [
  { key: 'workflow', categoryColor: 'bg-brand-mint/15 text-brand-mint', date: '2026-03-18', slug: 'my-ai-workflow' },
  { key: 'siberian', categoryColor: 'bg-brand-coral/15 text-brand-coral', date: '2026-03-15', slug: 'siberian-spring-care' },
  { key: 'sakura', categoryColor: 'bg-brand-taro/15 text-brand-taro', date: '2026-03-12', slug: 'osaka-sakura-2026' },
  { key: 'openclaw', categoryColor: 'bg-brand-cyan/15 text-brand-cyan', date: '2026-03-10', slug: 'openclaw-multi-instance' },
  { key: 'clinic', categoryColor: 'bg-brand-mango/15 text-brand-mango', date: '2026-03-08', slug: 'ai-clinic-case' },
];

function SpotlightCard({ item, index, t }: { item: FeedItem; index: number; t: (key: string) => string }) {
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
        className="relative flex-shrink-0 w-[300px] sm:w-[340px] glass-card p-5 cursor-pointer overflow-hidden group"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
      >
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74,222,128,0.08), transparent 60%)`,
            }}
          />
        )}

        <div className="relative z-20">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className={`text-xs ${item.categoryColor} border-0`}>
              {t(`feed_items.${item.key}.category`)}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {item.date}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-snug mb-2 group-hover:text-brand-mint transition-colors">
            {t(`feed_items.${item.key}.title`)}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {t(`feed_items.${item.key}.summary`)}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function FeedSection({ hideTitle = false }: { hideTitle?: boolean }) {
  const t = useTranslations('home');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className={hideTitle ? '' : 'py-16 sm:py-20'}>
      {!hideTitle && (
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
      )}

      <div className="scroll-fade-edge">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 px-4 sm:px-[max(1.5rem,calc((100vw-64rem)/2+1.5rem))]">
            {feedData.map((item, i) => (
              <SpotlightCard key={item.key} item={item} index={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
