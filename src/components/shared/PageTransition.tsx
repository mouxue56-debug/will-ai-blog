'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        transition={{
          duration: 0.35,
          ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth feel
        }}
        style={{ willChange: 'opacity, transform, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
