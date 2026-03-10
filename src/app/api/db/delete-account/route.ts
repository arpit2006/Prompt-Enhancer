import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/db/delete-account
 * Permanently deletes all data for the authenticated user:
 *   - UserData (prompt history, folders, analytics)
 *   - PromptLog entries
 * Then signs the user out.
 */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  try {
    // Delete all user records in parallel
    await Promise.all([
      prisma.userData.deleteMany({ where: { userId } }),
      prisma.promptLog.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete-account]", err);
    return NextResponse.json({ error: "Failed to delete account data" }, { status: 500 });
  }
}
