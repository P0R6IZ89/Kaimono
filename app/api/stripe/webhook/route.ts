import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAiCreditPack, grantAiCredits } from "@/lib/ai-credits";

export const runtime = "nodejs";

type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      payment_status?: string;
      metadata?: Record<string, string | undefined>;
    };
  };
};

function logStripeWebhook(message: string, details?: Record<string, unknown>) {
  console.info("[stripe-webhook]", {
    message,
    ...details,
  });
}

function logStripeWebhookError(
  message: string,
  details?: Record<string, unknown>,
) {
  console.error("[stripe-webhook]", {
    message,
    ...details,
  });
}

function parseStripeSignature(header: string | null) {
  if (!header) return null;

  const parts = header
    .split(",")
    .reduce<Record<string, string[]>>((acc, part) => {
      const [key, value] = part.split("=");
      if (!key || !value) return acc;
      acc[key] = [...(acc[key] ?? []), value];
      return acc;
    }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];
  if (!timestamp || signatures.length === 0) return null;

  return { timestamp, signatures };
}

function isValidStripeSignature(input: {
  body: string;
  signatureHeader: string | null;
  secret: string;
}) {
  const parsed = parseStripeSignature(input.signatureHeader);
  if (!parsed) return false;

  const signedPayload = `${parsed.timestamp}.${input.body}`;
  const expected = crypto
    .createHmac("sha256", input.secret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return parsed.signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");
    return (
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });
}

async function handleCheckoutCompleted(event: StripeWebhookEvent) {
  const session = event.data.object;
  if (!session.id || session.payment_status !== "paid") {
    logStripeWebhook("Skipping checkout session because payment is not paid.", {
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  const userId = session.metadata?.userId;
  const packId = session.metadata?.packId;
  const credits = Number(session.metadata?.credits);
  const pack = packId ? getAiCreditPack(packId) : null;

  if (!userId || !pack || credits !== pack.credits) {
    logStripeWebhookError("Checkout session metadata is invalid.", {
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      hasUserId: !!userId,
      packId,
      credits,
      expectedCredits: pack?.credits,
      subdomain: session.metadata?.subdomain,
      locale: session.metadata?.locale,
    });
    throw new Error(
      "Stripe checkout session is missing valid credit metadata.",
    );
  }

  try {
    await grantAiCredits({
      userId,
      credits: pack.credits,
      description: `Purchased ${pack.credits} AI extraction credits`,
      externalId: `stripe_checkout_session:${session.id}`,
      metadata: {
        stripeEventId: event.id,
        stripeCheckoutSessionId: session.id,
        packId: pack.id,
        subdomain: session.metadata?.subdomain,
        locale: session.metadata?.locale,
      },
    });
    logStripeWebhook("Granted AI credits for checkout session.", {
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      userId,
      packId: pack.id,
      credits: pack.credits,
      subdomain: session.metadata?.subdomain,
      locale: session.metadata?.locale,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      logStripeWebhook("Skipping duplicate checkout credit grant.", {
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        userId,
        packId: pack.id,
      });
      return;
    }

    logStripeWebhookError("Failed to grant AI credits.", {
      eventId: event.id,
      eventType: event.type,
      sessionId: session.id,
      userId,
      packId: pack.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logStripeWebhookError("Webhook secret is not configured.");
    return NextResponse.json(
      {
        code: "WEBHOOK_NOT_CONFIGURED",
        error: "Stripe webhook is not configured.",
      },
      { status: 503 },
    );
  }

  const body = await req.text();
  const isValid = isValidStripeSignature({
    body,
    signatureHeader: req.headers.get("stripe-signature"),
    secret: webhookSecret,
  });

  if (!isValid) {
    logStripeWebhookError("Webhook signature verification failed.", {
      hasSignatureHeader: !!req.headers.get("stripe-signature"),
    });
    return NextResponse.json(
      { code: "INVALID_SIGNATURE", error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  const event = JSON.parse(body) as StripeWebhookEvent;
  logStripeWebhook("Received Stripe webhook event.", {
    eventId: event.id,
    eventType: event.type,
  });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await handleCheckoutCompleted(event);
  } else {
    logStripeWebhook("Ignoring unsupported Stripe webhook event.", {
      eventId: event.id,
      eventType: event.type,
    });
  }

  return NextResponse.json({ received: true });
}
