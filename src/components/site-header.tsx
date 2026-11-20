"use client";

import { Link } from "@yamada-ui/react";
import NextLink from "next/link";
import { COLORS } from "./ui";

/** Minimal header: the dock handles navigation, so only the wordmark remains. */
export function SiteHeader() {
  return (
    <header className="topbar">
      <Link
        asChild
        color={COLORS.ink}
        fontSize="26px"
        fontWeight={700}
        letterSpacing="-1.5px"
        textDecoration="none"
        display="inline-block"
        gap="0"
      >
        <NextLink href="/">
          outfiter<span style={{ color: COLORS.orange }}>.</span>
        </NextLink>
      </Link>
    </header>
  );
}
