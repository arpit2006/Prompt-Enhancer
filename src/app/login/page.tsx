import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginCard } from "./login-card";

export const metadata = { title: "Sign In — PromptCraft" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  // Wrap only the auth() call: a corrupted session cookie (JWTSessionError)
  // redirects to the cleanup route which deletes stale authjs.* cookies.
  // NOTE: redirect() must be called OUTSIDE try/catch — Next.js implements
  // redirect() by throwing a special error that propagates up; catching it
  // swallows the redirect and causes the catch block to run instead.
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/api/auth/clear");
  }

  // Already signed in → go to app (called outside try/catch so it propagates)
  if (session?.user) redirect("/app");

  const { callbackUrl, error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-64 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <Suspense>
          <LoginCard
            callbackUrl={callbackUrl}
            error={error}
            isDev={process.env.NODE_ENV === "development"}
          />
        </Suspense>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        By signing in you agree to our{" "}
        <span className="underline cursor-pointer">Terms</span> &{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>
      </footer>
    </div>
  );
}
