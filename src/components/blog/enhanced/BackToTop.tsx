'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'fixed z-50 flex h-11 w-11 items-center justify-center rounded-full',
        'bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan',
        'cursor-pointer transition-all duration-300',
        'hover:bg-brand-cyan/20 hover:border-brand-cyan/50 hover:scale-110',
        'bottom-8 right-6 xl:bottom-8 xl:right-8',
        // On screens below xl, lift above the mobile TOC button
        'max-xl:bottom-28 max-xl:right-4',
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
