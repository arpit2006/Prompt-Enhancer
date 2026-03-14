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
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/api/auth/clear");
  }

  if (session?.user) redirect("/app");

  const { callbackUrl, error } = await searchParams;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07080f] overflow-hidden">

      {/* ── Animated gradient orbs ── */}
      <div className="pointer-events-none select-none" aria-hidden>
        {/* Large violet orb top-left */}
        <div
          className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)",
            animation: "orbFloat1 12s ease-in-out infinite",
          }}
        />
        {/* Indigo orb top-right */}
        <div
          className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            animation: "orbFloat2 15s ease-in-out infinite",
          }}
        />
        {/* Pink orb bottom-center */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[460px] w-[460px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
            animation: "orbFloat3 18s ease-in-out infinite",
          }}
        />
        {/* Cyan accent bottom-right */}
        <div
          className="absolute bottom-10 -right-10 h-[280px] w-[280px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
            animation: "orbFloat1 20s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* ── Dot grid overlay ── */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* ── Noise texture overlay for depth ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <style>{`
        @keyframes orbFloat1 {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33%      { transform: translateY(-30px) translateX(15px); }
          66%      { transform: translateY(15px) translateX(-20px); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translateY(0px) translateX(0px); }
          40%      { transform: translateY(25px) translateX(-18px); }
          70%      { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translateX(-50%) translateY(0px); }
          50%      { transform: translateX(-50%) translateY(-25px); }
        }
      `}</style>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16">
        <Suspense>
          <LoginCard
            callbackUrl={callbackUrl}
            error={error}
            isDev={process.env.NODE_ENV === "development"}
          />
        </Suspense>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-white/25">
        By signing in you agree to our{" "}
        <span className="underline cursor-pointer hover:text-white/50 transition-colors">Terms</span>{" "}&{" "}
        <span className="underline cursor-pointer hover:text-white/50 transition-colors">Privacy Policy</span>
      </footer>
    </div>
  );
}
