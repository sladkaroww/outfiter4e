import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your outfiter account and start your digital wardrobe.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center">
      <Suspense>
        <SignUp />
      </Suspense>
    </main>
  );
}
