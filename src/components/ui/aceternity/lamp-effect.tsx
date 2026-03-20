"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LampEffectProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function LampEffect({
  children,
  color = "cyan",
  className,
}: LampEffectProps) {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500",
    blue: "from-blue-500",
    purple: "from-purple-500",
    pink: "from-pink-500",
    green: "from-green-500",
    amber: "from-amber-500",
  };

  const glowColorMap: Record<string, string> = {
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
  };

  const fromColor = colorMap[color] || "from-cyan-500";
  const glowColor = glowColorMap[color] || "bg-cyan-500";

  return (
    <div
      className={cn(
        "relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Lamp container */}
      <div className="relative flex w-full flex-1 items-center justify-center">
        {/* Conic gradient base */}
        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          style={{
            backgroundImage: `conic-gradient(var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto right-1/2 h-56 overflow-visible from-transparent via-transparent to-transparent bg-gradient-conic",
            fromColor,
            "[--conic-position:from_70deg_at_center_top]"
          )}
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          style={{
            backgroundImage: `conic-gradient(var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto left-1/2 h-56 overflow-visible from-transparent via-transparent to-transparent bg-gradient-conic",
            fromColor,
            "[--conic-position:from_290deg_at_center_top]"
          )}
        >
          <div className="absolute bottom-0 right-0 z-20 h-[100%] w-40 bg-background [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Top glow line */}
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          className={cn(
            "absolute inset-auto z-30 h-0.5 w-64 -translate-y-[7rem] rounded-full blur-sm",
            glowColor
          )}
        />
        <motion.div
          initial={{ width: "4rem" }}
          whileInView={{ width: "12rem" }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          viewport={{ once: true }}
          className={cn(
            "absolute inset-auto z-30 h-px w-48 -translate-y-[7rem]",
            glowColor
          )}
        />

        {/* Blur overlay */}
        <div className="pointer-events-none absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-background" />
      </div>

      {/* Content */}
      <div className="relative z-50 -mt-32 flex flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
}
