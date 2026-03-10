import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/db/sync — load all user data from Supabase
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  try {
    const data = await prisma.userData.findUnique({ where: { userId } });
    if (!data) {
      return NextResponse.json({ entries: [], folders: [], analytics: [] });
    }
    return NextResponse.json({
      entries: data.entries,
      folders: data.folders,
      analytics: data.analytics,
    });
  } catch (err) {
    console.error("[db/sync GET]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// POST /api/db/sync — save all user data to Supabase (full replace)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  try {
    const body = await req.json();
    const { entries = [], folders = [], analytics = [] } = body;

    await prisma.userData.upsert({
      where: { userId },
      update: { entries, folders, analytics },
      create: { userId, entries, folders, analytics },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[db/sync POST]", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
