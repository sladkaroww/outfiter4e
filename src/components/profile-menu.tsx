"use client";

import { LogOutIcon, Menu, SettingsIcon, UserIcon } from "@yamada-ui/react";
import { useClerk } from "@clerk/nextjs";
import { COLORS } from "./ui";

/**
 * Dock profile entry: account management plus the sign-out action that the
 * header no longer provides.
 */
export function ProfileMenu() {
  const { openUserProfile, signOut } = useClerk();

  function handleSelect(value?: string) {
    if (value === "account") void openUserProfile();
    if (value === "signout") void signOut({ redirectUrl: "/" });
  }

  return (
    <Menu.Root placement="end-end" onSelect={handleSelect}>
      <Menu.Trigger asChild>
        <button type="button" className="app-dock-tab" aria-label="Profile" title="Profile">
          <UserIcon style={{ width: 19, height: 19 }} />
        </button>
      </Menu.Trigger>

      <Menu.Content
        minW="210px"
        p="1.5"
        bg={COLORS.paper}
        borderWidth="1px"
        borderColor={COLORS.line}
        rounded="10px"
        boxShadow="0 18px 44px rgba(23,22,21,.18)"
      >
        <Menu.Item value="account" px="2.5" py="2" rounded="7px" gap="3" _hover={{ bg: "#f4efe8" }}>
          <SettingsIcon style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 13 }}>Manage account</span>
        </Menu.Item>
        <Menu.Item value="signout" px="2.5" py="2" rounded="7px" gap="3" _hover={{ bg: "#f4efe8" }}>
          <LogOutIcon style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 13 }}>Sign out</span>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
