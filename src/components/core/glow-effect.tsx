"use client";

import { motion } from "motion/react";

const BLUR = { sm: "blur(14px)", medium: "blur(26px)", large: "blur(42px)" } as const;

type GlowEffectProps = {
  colors?: string[];
  blur?: keyof typeof BLUR;
  duration?: number;
};

/**
 * Animated, blurred colour blobs. Sits behind a button to create the
 * "glowing submit" effect while a request is in flight.
 */
export function GlowEffect({
  colors = ["#0894FF", "#C959DD", "#FF2E54", "#FF9004"],
  blur = "medium",
  duration = 4,
}: GlowEffectProps) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}
    >
      {colors.map((color, index) => (
        <motion.span
          key={`${color}-${index}`}
          style={{
            position: "absolute",
            left: `${(index * 28) % 72}%`,
            top: `${(index * 34) % 62}%`,
            width: "58%",
            height: "80%",
            borderRadius: "9999px",
            background: color,
            filter: BLUR[blur],
            mixBlendMode: "screen",
            opacity: 0.9,
          }}
          animate={{
            x: ["-25%", "35%", "-15%"],
            y: ["10%", "-25%", "20%"],
            scale: [1, 1.25, 0.95],
          }}
          transition={{
            duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.35,
          }}
        />
      ))}
    </div>
  );
}
