'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/lib/blog-types';
import { ALL_CATEGORIES, CATEGORY_KEYS } from '@/lib/blog-types';

const CATEGORY_BG: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border-brand-cyan/30',
  tech: 'bg-brand-mint/20 text-brand-mint hover:bg-brand-mint/30 border-brand-mint/30',
  life: 'bg-brand-coral/20 text-brand-coral hover:bg-brand-coral/30 border-brand-coral/30',
  cats: 'bg-brand-mango/20 text-brand-mango hover:bg-brand-mango/30 border-brand-mango/30',
  business: 'bg-brand-taro/20 text-brand-taro hover:bg-brand-taro/30 border-brand-taro/30',
  learning: 'bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 border-brand-cyan/30',
};

const CATEGORY_ACTIVE: Record<BlogCategory, string> = {
  ai: 'bg-brand-cyan text-white border-brand-cyan',
  tech: 'bg-brand-mint text-white border-brand-mint',
  life: 'bg-brand-coral text-white border-brand-coral',
  cats: 'bg-brand-mango text-white border-brand-mango',
  business: 'bg-brand-taro text-white border-brand-taro',
  learning: 'bg-brand-cyan text-white border-brand-cyan',
};

interface CategoryFilterProps {
  selected: BlogCategory | null;
  onSelect: (category: BlogCategory | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const t = useTranslations('blog');

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-200',
          selected === null
            ? 'bg-foreground text-background border-foreground'
            : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
        )}
      >
        {t('all')}
      </button>
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-200',
            selected === cat ? CATEGORY_ACTIVE[cat] : CATEGORY_BG[cat]
          )}
        >
          {t(CATEGORY_KEYS[cat])}
        </button>
      ))}
    </div>
  );
}
