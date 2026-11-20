"use client";

import { Modal } from "@yamada-ui/react";
import type { ReactNode } from "react";
import { COLORS } from "./index";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Compact Yamada `Modal` shell used by every upload flow. It handles the
 * overlay, focus trap, Escape and scroll locking for us.
 */
export function AppModal({ open, onClose, title, eyebrow, description, children, footer }: AppModalProps) {
  return (
    <Modal.Root open={open} onClose={onClose} placement="center" blockScrollOnMount>
      <Modal.Overlay bg="rgba(20, 18, 16, 0.55)" />
      <Modal.Content
        bg={COLORS.paper}
        color={COLORS.ink}
        rounded="6px"
        w="min(100%, 420px)"
        maxW="420px"
        maxH="calc(100vh - 32px)"
        overflowY="auto"
        p="5.5"
        boxShadow="0 25px 80px rgba(0,0,0,.25)"
        display="grid"
        gap="3"
      >
        <Modal.CloseButton position="absolute" top="2" right="2.5" color={COLORS.muted} _hover={{ color: COLORS.ink }} />

        <Modal.Header p="0" display="block">
          {eyebrow && (
            <p className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</p>
          )}
          <Modal.Title fontSize="25px" fontWeight="700" letterSpacing="-1px" lineHeight="1.1">
            {title}
          </Modal.Title>
          {description && (
            <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: "12.5px", lineHeight: 1.4 }}>
              {description}
            </p>
          )}
        </Modal.Header>

        <Modal.Body p="0" display="grid" gap="3">{children}</Modal.Body>

        {footer && <Modal.Footer p="0" mt="1">{footer}</Modal.Footer>}
      </Modal.Content>
    </Modal.Root>
  );
}
