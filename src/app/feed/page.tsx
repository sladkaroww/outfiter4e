import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FeedView } from "@/components/feed-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Feed",
  description: "Outfits from the outfiter community.",
  alternates: { canonical: "/feed" },
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=%2Ffeed");
  return (
    <main id="main-content">
      <SiteHeader />
      <div className="content-shell page-shell app-with-dock"><FeedView /></div>
      <SiteFooter />
    </main>
  );
}

