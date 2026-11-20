"use client";

import { UIProvider } from "@yamada-ui/react";
import { appTheme } from "@/theme";

/**
 * Yamada UI provider. `colorMode="light"` pins the app to its light design
 * instead of following the OS, so server and client render the same classes.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider theme={appTheme} colorMode="light">
      {children}
    </UIProvider>
  );
}
