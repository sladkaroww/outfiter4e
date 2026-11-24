import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import AppButton from "@/components/ui/app-button";

export default function NotFound() {
  return (
    <main id="main-content">
      <SiteHeader />
      <section className="content-shell page-shell not-found">
        <p className="eyebrow">404</p>
        <h1>This page went out of style.</h1>
        <p>We could not find that page. It may have moved, or the link may be wrong.</p>
        <div className="hero-actions">
          <AppButton href="/feed">Go to the feed</AppButton>
          <AppButton href="/" variant="secondary">Back home</AppButton>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
