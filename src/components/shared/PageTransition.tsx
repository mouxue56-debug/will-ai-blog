'use client';

import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : 0.25,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ willChange: prefersReducedMotion ? 'opacity' : 'opacity, transform' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
