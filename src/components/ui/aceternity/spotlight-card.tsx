"use client";

import { useRef, useCallback, useEffect, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "a";
}

export function SpotlightCard({
  children,
  className,
  as: Component = "div",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const updateSpotlight = useCallback((x: number, y: number) => {
    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 40%)`;
    }
    if (borderRef.current) {
      borderRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.1), transparent 40%)`;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || !isActiveRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Use requestAnimationFrame to throttle DOM updates
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        updateSpotlight(x, y);
        rafRef.current = null;
      });
    }
  }, [updateSpotlight]);

  const handleMouseEnter = useCallback(() => {
    isActiveRef.current = true;
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "1";
    }
    if (borderRef.current) {
      borderRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isActiveRef.current = false;
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "0";
    }
    if (borderRef.current) {
      borderRef.current.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const Tag = Component as ElementType;

  return (
    <Tag
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-black/50 p-8",
        className
      )}
    >
      {/* Spotlight gradient - using direct DOM manipulation to avoid React re-renders */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 will-change-[opacity]"
      />
      {/* Border glow */}
      <div
        ref={borderRef}
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 will-change-[opacity]"
        style={{
          mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
