"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  delay?: number;
}

export function TextGenerateEffect({
  words,
  className,
  delay = 0.05,
}: TextGenerateEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [started, setStarted] = useState(false);
  const wordsArray = words.split("");

  useEffect(() => {
    if (isInView) {
      setStarted(true);
    }
  }, [isInView]);

  return (
    <div ref={ref} className={cn("font-bold", className)}>
      {wordsArray.map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={
            started
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.4,
            delay: idx * delay,
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}
