import { extendTheme } from "@yamada-ui/react";

/**
 * Yamada UI theme for outfiter.
 *
 * Fonts and the cream/ink palette keep the app's existing look while the
 * components come from Yamada UI. Component-level styling lives next to the
 * components (see src/components/ui) so the design stays in one place.
 */
export const appTheme = extendTheme({
  fonts: {
    body: '"Allo", system-ui, sans-serif',
    heading: '"Allo", system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  semanticTokens: {
    colors: {
      bg: { base: "#f6f3ee" },
      fg: { base: "#171615" },
      border: { base: "#ded9d1" },
    },
  },
});
