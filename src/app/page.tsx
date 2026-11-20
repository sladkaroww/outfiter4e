import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";

/**
 * Signed-in visitors land on the community feed instead of the marketing page.
 * Signed-out visitors still see the landing page.
 */
export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/feed");
  return <LandingPage />;
}
