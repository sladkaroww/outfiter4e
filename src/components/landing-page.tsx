"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Image } from "@yamada-ui/react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppButton } from "@/components/ui";

/**
 * Marketing landing page. Signed-in visitors never see it: `/` redirects them
 * to the feed before this component renders.
 */
export function LandingPage() {
  return (
    <main id="main-content">
      <SiteHeader />

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR STYLE, YOUR STORY</p>
          <h1>Wear it.<br /><em>Share it.</em></h1>
          <p className="hero-copy">
            Inspiration from real people, outfits from your wardrobe, and a place where your personal style shows.
          </p>
          <div className="hero-actions">
            <AppButton href="/feed">Browse the feed <span>↗</span></AppButton>
            <Show when="signed-in">
              <AppButton href="/wardrobe" variant="secondary">+ My wardrobe</AppButton>
            </Show>
            <Show when="signed-out">
              <SignUpButton mode="redirect" forceRedirectUrl="/feed">
                <AppButton variant="secondary">Create account</AppButton>
              </SignUpButton>
            </Show>
          </div>
        </div>

        <div className="hero-card">
          <Image
            src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85"
            alt="A person wearing a tailored outfit on a city street"
            className="hero-image"
            fetchPriority="high"
          />
          <div className="hero-card-caption">
            <span>01 / 04</span>
            <strong>Quiet confidence</strong>
            <small>by @nora.style</small>
          </div>
        </div>
      </section>

      <section className="landing-links content-shell">
        <div>
          <p className="eyebrow">START HERE</p>
          <h2>One place for your style.</h2>
          <p className="hero-copy">
            Jump into the feed, share your fit, or organize your digital wardrobe.
          </p>
        </div>
        <div className="quick-link-grid">
          <NextLink className="quick-link-card" href="/feed">
            <strong>Feed</strong>
            <span>See the latest fits →</span>
          </NextLink>
          <Show when="signed-in">
            <NextLink className="quick-link-card" href="/wardrobe">
              <strong>My wardrobe</strong>
              <span>Add and search pieces →</span>
            </NextLink>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <AppButton variant="secondary" fullWidth>My wardrobe — sign in to open it</AppButton>
            </SignInButton>
          </Show>
        </div>
      </section>

      <section className="cta-band content-shell">
        <div>
          <p className="eyebrow">READY WHEN YOU ARE</p>
          <h2>Start your wardrobe today.</h2>
          <p className="hero-copy">Create an account, add your first piece and share the outfit.</p>
        </div>
        <div className="hero-actions">
          <AppButton href="/feed">Open the feed</AppButton>
          <AppButton href="/wardrobe" variant="secondary">Build your wardrobe</AppButton>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
