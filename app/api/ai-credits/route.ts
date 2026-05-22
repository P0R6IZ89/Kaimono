import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAiCreditBalance } from "@/lib/ai-credits";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", error: "Please log in to view AI credits." },
      { status: 401 },
    );
  }

  const credits = await getAiCreditBalance(session.user.id);

  return NextResponse.json({ credits });
}
