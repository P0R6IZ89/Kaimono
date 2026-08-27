import { deleteExpiredDemoGuests } from "@/lib/demo-guest";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    req.headers.get("Authorization") !== `Bearer ${cronSecret}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await deleteExpiredDemoGuests();
  return NextResponse.json(result);
}
