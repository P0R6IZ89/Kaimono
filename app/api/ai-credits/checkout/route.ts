import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAiCreditPack } from "@/lib/ai-credits";

type CheckoutRequestBody = {
  packId?: unknown;
  returnUrl?: unknown;
};

function normalizeReturnUrl(value: unknown, origin: string) {
  if (typeof value !== "string") return origin;

  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return origin;
    return url.toString();
  } catch {
    return origin;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", error: "Please log in to add AI credits." },
      { status: 401 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        code: "CHECKOUT_NOT_CONFIGURED",
        error: "AI credit checkout is not configured.",
      },
      { status: 503 },
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = (await req.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json(
      { code: "INVALID_REQUEST", error: "Choose a valid credit pack." },
      { status: 400 },
    );
  }

  const pack =
    typeof body.packId === "string" ? getAiCreditPack(body.packId) : null;
  if (!pack) {
    return NextResponse.json(
      { code: "INVALID_PACK", error: "Choose a valid credit pack." },
      { status: 400 },
    );
  }

  const origin = req.nextUrl.origin;
  const returnUrl = normalizeReturnUrl(
    body.returnUrl ?? req.headers.get("referer"),
    origin,
  );
  const successUrl = new URL(returnUrl);
  successUrl.searchParams.set("aiCredits", "success");
  const cancelUrl = new URL(returnUrl);
  cancelUrl.searchParams.set("aiCredits", "cancelled");

  const params = new URLSearchParams({
    mode: "payment",
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    "metadata[userId]": session.user.id,
    "metadata[packId]": pack.id,
    "metadata[credits]": String(pack.credits),
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(pack.amountCents),
    "line_items[0][price_data][product_data][name]": pack.name,
    "line_items[0][price_data][product_data][description]":
      "AI extraction credits help cover processing costs.",
  });

  if (session.user.email) {
    params.set("customer_email", session.user.email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = (await response.json()) as {
    url?: string;
    error?: { message?: string };
  };
  if (!response.ok || !data.url) {
    return NextResponse.json(
      {
        code: "CHECKOUT_FAILED",
        error: data.error?.message ?? "Could not start checkout.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: data.url });
}
