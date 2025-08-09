import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const now = new Date();
  const result = await prisma.invitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
  return new Response(
    JSON.stringify({
      message: "Expired invites processed",
      expiredCount: result.count,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
