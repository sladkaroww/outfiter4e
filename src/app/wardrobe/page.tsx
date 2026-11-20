import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WardrobeView } from "@/components/wardrobe-view";

export const metadata: Metadata = {
  title: "Wardrobe",
  description: "Your private digital wardrobe.",
  alternates: { canonical: "/wardrobe" },
  robots: { index: false, follow: false },
};

export default async function WardrobePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=%2Fwardrobe");
  return (
    <main id="main-content">
      <SiteHeader />
      <div className="content-shell page-shell app-with-dock"><WardrobeView /></div>
      <SiteFooter />
    </main>
  );
}

