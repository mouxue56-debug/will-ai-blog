'use client';

import { motion, type Variants, useReducedMotion } from 'motion/react';
import { Children, type ReactNode, memo, useMemo } from 'react';

type RevealDirection = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleIn';

const directionVariants: Record<RevealDirection, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
  margin?: string;
  as?: 'div' | 'section' | 'article' | 'ul';
}

// Memoized child wrapper to prevent unnecessary re-renders
const RevealChild = memo(function RevealChild({
  child,
  variants,
  duration,
}: {
  child: ReactNode;
  variants: Variants;
  duration: number;
}) {
  return (
    <motion.div
      variants={variants}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {child}
    </motion.div>
  );
});

export function ScrollReveal({
  children,
  direction = 'fadeUp',
  duration = 0.5,
  delay = 0,
  stagger,
  className,
  once = true,
  margin = '0px',
  as = 'div',
}: ScrollRevealProps) {
  const variants = useMemo(() => directionVariants[direction], [direction]);
  const Tag = motion[as] as typeof motion.div;
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  if (stagger !== undefined) {
    const childArray = Children.toArray(children);

    return (
      <Tag
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin, amount: 0.1 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: stagger,
              delayChildren: delay,
            },
          },
        }}
      >
        {childArray.map((child, i) => (
          <RevealChild key={i} child={child} variants={variants} duration={duration} />
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin, amount: 0.1 }}
      variants={variants}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </Tag>
  );
}
