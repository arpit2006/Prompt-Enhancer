import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { testOllamaConnection } from "@/lib/ollama";
import { validateOllamaEndpoint } from "@/lib/security";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint } = (await req.json()) as { endpoint?: string };
    const resolvedEndpoint = endpoint ?? "http://localhost:11434";

    if (!validateOllamaEndpoint(resolvedEndpoint)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Ollama endpoint. Only localhost addresses are permitted." },
        { status: 400 }
      );
    }

    const result = await testOllamaConnection(resolvedEndpoint);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, models: [], error: "Server error." }, { status: 500 });
  }
}
