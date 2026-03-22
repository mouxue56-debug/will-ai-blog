"use client";

import { useRef, useState, useCallback, useEffect, type ElementType, type ReactNode } from "react";
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
}: SpotlightCardProps & Record<string, unknown>) {
  const divRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback(() => {
    setPosition({ ...positionRef.current });
    rafRef.current = null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    positionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    // Use requestAnimationFrame to throttle state updates
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(updatePosition);
    }
  }, [updatePosition]);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
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
      {/* Spotlight gradient */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 will-change-[opacity]"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {/* Border glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300 will-change-[opacity]"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
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
