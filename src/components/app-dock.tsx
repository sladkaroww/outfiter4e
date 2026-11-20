"use client";

import { HouseIcon, PlusIcon, ShirtIcon } from "@yamada-ui/react";
import { motion } from "motion/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ItemUploadModal } from "./item-upload-modal";
import { PostUploadModal } from "./post-upload-modal";
import { ProfileMenu } from "./profile-menu";
import { UploadMenu } from "./upload-menu";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed", Icon: HouseIcon },
  { href: "/wardrobe", label: "Wardrobe", Icon: ShirtIcon },
];

/**
 * Floating dock over the page content, inspired by the animated tab bar:
 * a shared motion pill slides behind the active tab.
 */
export function AppDock() {
  const pathname = usePathname();
  const [showPost, setShowPost] = useState(false);
  const [showItem, setShowItem] = useState(false);

  // The dock belongs to the signed-in app pages; both routes already redirect
  // anonymous visitors to sign-in on the server.
  if (pathname !== "/feed" && pathname !== "/wardrobe") return null;

  return (
    <>
      <nav className="app-dock" aria-label="Main navigation">
        <div className="app-dock-inner">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <NextLink
                key={href}
                href={href}
                className="app-dock-tab"
                data-active={active}
                aria-label={label}
                title={label}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="dock-active"
                    className="app-dock-pill"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <Icon style={{ width: 19, height: 19, position: "relative" }} />
              </NextLink>
            );
          })}

          <UploadMenu
            placement="end-end"
            onUploadPost={() => setShowPost(true)}
            onAddItem={() => setShowItem(true)}
            trigger={
              <button type="button" className="app-dock-tab" aria-label="Add" title="Add">
                <PlusIcon style={{ width: 21, height: 21 }} />
              </button>
            }
          />

          <ProfileMenu />
        </div>
      </nav>

      {showPost && <PostUploadModal onClose={() => setShowPost(false)} />}
      {showItem && <ItemUploadModal onClose={() => setShowItem(false)} />}
    </>
  );
}
