"use client";

import { AnimatePresence, motion } from "motion/react";
import { GlowEffect } from "@/components/core/glow-effect";
import { TextMorph } from "@/components/core/text-morph";
import { AppButton, type AppButtonProps } from "./index";

type GlowSubmitProps = Omit<AppButtonProps, "children" | "loading" | "type"> & {
  loading: boolean;
  idleLabel: string;
  loadingLabel: string;
};

/**
 * Submit button that glows while the request is running and morphs its label,
 * used at the end of both upload forms.
 */
export function GlowSubmit({ loading, idleLabel, loadingLabel, ...rest }: GlowSubmitProps) {
  return (
    <div style={{ position: "relative", marginTop: 6 }}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <GlowEffect />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: "relative" }}>
        <AppButton type="submit" fullWidth loading={loading} {...rest}>
          <TextMorph>{loading ? loadingLabel : idleLabel}</TextMorph>
        </AppButton>
      </div>
    </div>
  );
}
