"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  header?: ReactNode;
  icon?: ReactNode;
}

export function BentoGridItem({
  children,
  className,
  title,
  description,
  header,
  icon,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-white/10 bg-black/50 p-4 shadow-lg transition duration-200 hover:shadow-xl",
        className
      )}
    >
      {header && <div className="overflow-hidden rounded-lg">{header}</div>}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        {title && (
          <div className="mb-2 mt-2 font-sans font-bold text-neutral-200">
            {title}
          </div>
        )}
        {description && (
          <div className="font-sans text-xs font-normal text-neutral-400">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
