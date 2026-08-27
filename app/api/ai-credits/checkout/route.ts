import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { routing, type Locale } from "@/i18n/routing";
import { getAiCreditPack } from "@/lib/ai-credits";
import { protocol, rootDomain } from "@/lib/variables";

type CheckoutRequestBody = {
  packId?: unknown;
  subdomain?: unknown;
  locale?: unknown;
};

function isValidSubdomain(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value)
  );
}

function isValidLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (routing.locales as readonly string[]).includes(value)
  );
}

function buildTenantCreditsUrl(input: {
  subdomain: string;
  locale: Locale;
  status: "success" | "cancelled";
}) {
  const url = new URL(
    `${protocol}://${input.subdomain}.${rootDomain}/${input.locale}/settings/ai-credits`,
  );
  url.searchParams.set("aiCredits", input.status);
  return url.toString();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", error: "Please log in to add AI credits." },
      { status: 401 },
    );
  }

  if (session.isDemo) {
    return NextResponse.json(
      {
        code: "DEMO_RESTRICTED",
        error: "Credit purchases are not available in the temporary demo.",
      },
      { status: 403 },
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

  if (!isValidSubdomain(body.subdomain) || !isValidLocale(body.locale)) {
    return NextResponse.json(
      {
        code: "INVALID_RETURN_TARGET",
        error: "Choose a valid return destination.",
      },
      { status: 400 },
    );
  }

  const successUrl = buildTenantCreditsUrl({
    subdomain: body.subdomain,
    locale: body.locale,
    status: "success",
  });
  const cancelUrl = buildTenantCreditsUrl({
    subdomain: body.subdomain,
    locale: body.locale,
    status: "cancelled",
  });

  const params = new URLSearchParams({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    "metadata[userId]": session.user.id,
    "metadata[packId]": pack.id,
    "metadata[credits]": String(pack.credits),
    "metadata[subdomain]": body.subdomain,
    "metadata[locale]": body.locale,
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
