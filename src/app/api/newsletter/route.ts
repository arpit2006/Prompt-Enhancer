import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/newsletter — subscribe ────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; name?: string; source?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Sanitise name and source
    const safeName   = body.name?.trim().slice(0, 100) || null;
    const safeSource = ["webapp", "landing", "profile"].includes(body.source ?? "")
      ? body.source!
      : "webapp";

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ status: "already_subscribed" }, { status: 200 });
      }
      // Re-subscribe if they had previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, subscribedAt: new Date() },
      });
      return NextResponse.json({ status: "resubscribed" }, { status: 200 });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: safeName,
        source: safeSource,
      },
    });

    return NextResponse.json({ status: "subscribed" }, { status: 201 });
  } catch (err) {
    console.error("[newsletter] POST error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

// ─── GET /api/newsletter?email=... — check status (auth required) ────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase();

    if (!email) return NextResponse.json({ subscribed: false });

    const row = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    return NextResponse.json({ subscribed: row?.isActive ?? false });
  } catch {
    return NextResponse.json({ subscribed: false });
  }
}
