"use client";

import { CameraIcon, Menu, PlusIcon, ShirtIcon } from "@yamada-ui/react";
import type { ReactNode } from "react";
import { AppIconButton, COLORS } from "./ui";

type UploadMenuProps = {
  onUploadPost: () => void;
  onAddItem: () => void;
  /** Where the panel opens relative to the trigger. */
  placement?: "end-end" | "start" | "start-end";
  /** Custom trigger (used by the dock). Defaults to the round "+" button. */
  trigger?: ReactNode;
};

/**
 * One "+" entry point that reveals both upload actions, built on Yamada's
 * `Menu` (keyboard navigation, focus management and outside-click for free).
 */
export function UploadMenu({
  onUploadPost,
  onAddItem,
  placement = "end-end",
  trigger,
}: UploadMenuProps) {
  function handleSelect(value?: string) {
    if (value === "post") onUploadPost();
    if (value === "item") onAddItem();
  }

  return (
    <Menu.Root placement={placement} onSelect={handleSelect}>
      <Menu.Trigger asChild>
        {trigger ?? (
          <AppIconButton
            className="upload-menu-trigger"
            variant="solid"
            size="lg"
            aria-label="Upload"
            title="Upload"
          >
            <PlusIcon style={{ width: 20, height: 20 }} />
          </AppIconButton>
        )}
      </Menu.Trigger>

      <Menu.Content
        minW="238px"
        p="1.5"
        bg={COLORS.paper}
        borderWidth="1px"
        borderColor={COLORS.line}
        rounded="10px"
        boxShadow="0 18px 44px rgba(23,22,21,.18)"
      >
        <Menu.Item
          value="post"
          px="2.5"
          py="2"
          rounded="7px"
          gap="3"
          _hover={{ bg: "#f4efe8" }}
          _focus={{ bg: "#f4efe8", outline: "none" }}
        >
          <span className="upload-menu-icon"><CameraIcon style={{ width: 17, height: 17 }} /></span>
          <span>
            <strong style={{ display: "block", fontSize: 13 }}>Post an outfit</strong>
            <small style={{ display: "block", color: COLORS.muted, fontSize: 11 }}>
              Photo, title, category
            </small>
          </span>
        </Menu.Item>

        <Menu.Item
          value="item"
          px="2.5"
          py="2"
          rounded="7px"
          gap="3"
          _hover={{ bg: "#f4efe8" }}
          _focus={{ bg: "#f4efe8", outline: "none" }}
        >
          <span className="upload-menu-icon"><ShirtIcon style={{ width: 17, height: 17 }} /></span>
          <span>
            <strong style={{ display: "block", fontSize: 13 }}>Add to wardrobe</strong>
            <small style={{ display: "block", color: COLORS.muted, fontSize: 11 }}>
              A new piece with a photo
            </small>
          </span>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
