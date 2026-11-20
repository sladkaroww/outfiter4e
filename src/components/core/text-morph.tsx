"use client";

import { AnimatePresence, motion } from "motion/react";

/** Cross-fades and slides between two strings (used inside submit buttons). */
export function TextMorph({ children }: { children: string }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={children}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
