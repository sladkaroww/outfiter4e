"use client";

import { Menu, PlusIcon, ShirtIcon, UploadIcon } from "@yamada-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ItemUploadModal } from "./item-upload-modal";
import { AppIconButton, COLORS } from "./ui";

/**
 * Header wardrobe logo. Clicking it reveals the two things you can do with a
 * wardrobe: open it, or add a piece without leaving the current page.
 */
export function WardrobeMenu() {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  function handleSelect(value?: string) {
    if (value === "visit") router.push("/wardrobe");
    if (value === "add") setShowAdd(true);
  }

  return (
    <>
      <Menu.Root placement="end-end" onSelect={handleSelect}>
        <Menu.Trigger asChild>
          <AppIconButton variant="ghost" size="md" aria-label="Wardrobe" title="Wardrobe">
            <ShirtIcon style={{ width: 19, height: 19 }} />
          </AppIconButton>
        </Menu.Trigger>

        <Menu.Content
          minW="240px"
          p="1.5"
          bg={COLORS.paper}
          borderWidth="1px"
          borderColor={COLORS.line}
          rounded="10px"
          boxShadow="0 18px 44px rgba(23,22,21,.18)"
        >
          <Menu.Item
            value="visit"
            px="2.5"
            py="2"
            rounded="7px"
            gap="3"
            _hover={{ bg: "#f4efe8" }}
            _focus={{ bg: "#f4efe8", outline: "none" }}
          >
            <span className="upload-menu-icon"><UploadIcon style={{ width: 17, height: 17 }} /></span>
            <span>
              <strong style={{ display: "block", fontSize: 13 }}>Open wardrobe</strong>
              <small style={{ display: "block", color: COLORS.muted, fontSize: 11 }}>
                Browse and search your collection
              </small>
            </span>
          </Menu.Item>

          <Menu.Item
            value="add"
            px="2.5"
            py="2"
            rounded="7px"
            gap="3"
            _hover={{ bg: "#f4efe8" }}
            _focus={{ bg: "#f4efe8", outline: "none" }}
          >
            <span className="upload-menu-icon"><PlusIcon style={{ width: 17, height: 17 }} /></span>
            <span>
              <strong style={{ display: "block", fontSize: 13 }}>Add a piece</strong>
              <small style={{ display: "block", color: COLORS.muted, fontSize: 11 }}>
                Without leaving this page
              </small>
            </span>
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>

      {showAdd && <ItemUploadModal onClose={() => setShowAdd(false)} />}
    </>
  );
}
