import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How outfiter collects, uses and protects your account, wardrobe and outfit data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <article className="content-shell page-shell legal-page">
        <p className="eyebrow">LEGAL</p>
        <h1>Privacy policy</h1>
        <p className="legal-updated">Last updated: 20 November 2026</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data</strong> from our authentication provider (Clerk): name, username, email address and avatar.</li>
          <li><strong>Content you create</strong>: wardrobe pieces, outfit posts, likes and the images you upload.</li>
          <li><strong>Technical data</strong> needed to run the service, such as error logs.</li>
        </ul>

        <h2>How we use it</h2>
        <p>To sign you in, store and show your wardrobe and posts, resolve likes and author names, and keep the service secure. We do not sell personal data.</p>

        <h2>Where data lives</h2>
        <ul>
          <li><strong>Clerk</strong> — authentication and account profiles.</li>
          <li><strong>Neon</strong> — Postgres database and object storage for images.</li>
          <li><strong>Google Gemini</strong> — only when you use AI recognition; the selected photo is sent to Google to suggest name, type, colour and description. Nothing is generated or stored unless you save it.</li>
          <li><strong>Analytics</strong> — only if you accept optional cookies; otherwise no analytics script is loaded.</li>
        </ul>

        <h2>Cookies</h2>
        <p>Essential cookies keep you signed in and protect requests. Optional analytics cookies are loaded only after you choose “Accept all” in the consent banner.</p>

        <h2>Retention and deletion</h2>
        <p>You can delete pieces and outfits from the app at any time. Deleting a post removes its likes and item links, and removes the image from storage. Account deletion can be requested by contacting us.</p>

        <h2>Your rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data, and withdraw analytics consent at any time.</p>

        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:privacy@outfiter.app">privacy@outfiter.app</a>.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
