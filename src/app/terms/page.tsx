import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for using outfiter: your account, your content, acceptable use and AI suggestions.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <article className="content-shell page-shell legal-page">
        <p className="eyebrow">LEGAL</p>
        <h1>Terms of service</h1>
        <p className="legal-updated">Last updated: 20 November 2026</p>

        <h2>Using outfiter</h2>
        <p>By creating an account you agree to these terms. You must be old enough to consent to data processing in your country and provide accurate account information.</p>

        <h2>Your content</h2>
        <p>You keep ownership of the photos and text you upload. You grant us the limited licence needed to store, resize and display that content inside the app. Only upload images you have the right to use.</p>

        <h2>Acceptable use</h2>
        <ul>
          <li>No harassment, hate speech, nudity or illegal content.</li>
          <li>No attempts to break, scrape or overload the service.</li>
          <li>No impersonation of other people.</li>
        </ul>
        <p>We may remove content or suspend accounts that break these rules.</p>

        <h2>AI suggestions</h2>
        <p>AI recognition is a convenience. Results may be wrong, and you are responsible for reviewing and editing them before saving.</p>

        <h2>Availability</h2>
        <p>The service is provided “as is”. We aim for high availability but do not guarantee uninterrupted service, and features may change.</p>

        <h2>Liability</h2>
        <p>To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of the service.</p>

        <h2>Changes</h2>
        <p>We may update these terms; material changes will be announced in the app. Continued use after changes means you accept the new terms.</p>

        <h2>Contact</h2>
        <p>Questions: <a href="mailto:hello@outfiter.app">hello@outfiter.app</a>.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
