"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBeamProps {
  pathD: string;
  duration?: number;
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function AnimatedBeam({
  pathD,
  duration = 3,
  color = "#6ee7b7",
  className,
  width = 400,
  height = 200,
}: AnimatedBeamProps) {
  const id = useId();
  const gradientId = `beam-gradient-${id}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none", className)}
    >
      {/* Background path */}
      <path
        d={pathD}
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={1}
      />

      {/* Animated beam */}
      <path
        d={pathD}
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
      />

      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color} stopOpacity={0} />
          <stop offset={0.5} stopColor={color} stopOpacity={1} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            from={`-${width} 0`}
            to={`${width} 0`}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
