"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  background?: string;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255,255,255,0.2)",
  shimmerSize = "60%",
  background = "rgba(0,0,0,0.8)",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-white/10 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(100,100,255,0.1)]",
        className
      )}
      style={{ background }}
      {...props}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer-slide"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            width: shimmerSize,
          }}
        />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Inline keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer-slide {
              0% { transform: translateX(-200%); }
              100% { transform: translateX(400%); }
            }
            .animate-shimmer-slide {
              animation: shimmer-slide 3s ease-in-out infinite;
            }
          `,
        }}
      />
    </button>
  );
}
