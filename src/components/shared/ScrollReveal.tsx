'use client';

import { motion, type Variants } from 'motion/react';
import { Children, type ReactNode } from 'react';

type RevealDirection = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleIn';

const directionVariants: Record<RevealDirection, Variants> = {
  fadeUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeLeft: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeRight: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
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

export function ScrollReveal({
  children,
  direction = 'fadeUp',
  duration = 0.5,
  delay = 0,
  stagger,
  className,
  once = true,
  margin = '-80px',
  as = 'div',
}: ScrollRevealProps) {
  const variants = directionVariants[direction];
  const Tag = motion[as] as typeof motion.div;

  if (stagger !== undefined) {
    const childArray = Children.toArray(children);

    return (
      <Tag
        className={className}
        style={{ willChange: 'opacity' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin }}
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
          <motion.div
            key={i}
            variants={variants}
            transition={{ duration, ease: 'easeOut' }}
          >
            {child}
          </motion.div>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={{ willChange: 'opacity' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </Tag>
  );
}
