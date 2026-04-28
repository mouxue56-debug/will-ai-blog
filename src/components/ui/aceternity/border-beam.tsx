"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "#6ee7b7",
  colorTo = "#818cf8",
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
      style={{
        overflow: "hidden",
        // mask to show only the border area
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        padding: "1px",
      }}
    >
      <div
        className="absolute inset-0 animate-border-beam"
        style={
          {
            "--border-beam-size": `${size}px`,
            "--border-beam-duration": `${duration}s`,
            "--border-beam-delay": `${delay}s`,
            "--border-beam-color-from": colorFrom,
            "--border-beam-color-to": colorTo,
            width: `${size}px`,
            height: `${size}px`,
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
            borderRadius: "50%",
            filter: "blur(4px)",
            animation: `border-beam-spin ${duration}s linear ${delay}s infinite`,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          } as React.CSSProperties
        }
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes border-beam-spin {
              0% { offset-distance: 0%; }
              100% { offset-distance: 100%; }
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-border-beam { animation: none !important; opacity: 0; }
            }
          `,
        }}
      />
    </div>
  );
}
