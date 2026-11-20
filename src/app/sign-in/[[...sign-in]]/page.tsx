import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your outfiter account.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center">
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
