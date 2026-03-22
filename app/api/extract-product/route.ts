import OpenAI from "openai";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserCapabilities } from "@/actions/userActions";
import { checkAiExtractRateLimit } from "@/lib/rate-limit";
import { validatePublicHttpUrl } from "@/lib/url-safety";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2_000_000;
const ALLOWED_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

type ProductData = {
  name: string | null;
  price: string | null;
  description: string | null;
  currency: string | null;
};

type ExtractSuccessResponse = {
  source: string;
  product: ProductData;
};

type ExtractErrorCode =
  | "UNAUTHORIZED"
  | "AI_EXTRACTION_NOT_ALLOWED"
  | "INVALID_URL"
  | "BLOCKED_URL"
  | "RATE_LIMITED"
  | "EXTRACTION_FAILED";

class RouteError extends Error {
  constructor(
    public status: number,
    public code: ExtractErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function createErrorResponse(
  status: number,
  code: ExtractErrorCode,
  error: string,
  init?: {
    headers?: HeadersInit;
    retryAfterSeconds?: number;
  },
) {
  return NextResponse.json(
    {
      code,
      error,
      ...(typeof init?.retryAfterSeconds === "number"
        ? { retryAfterSeconds: init.retryAfterSeconds }
        : {}),
    },
    {
      status,
      headers: init?.headers,
    },
  );
}

function buildRateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(remaining, 0)),
    "X-RateLimit-Reset": String(reset),
  };
}

function cleanText(value?: string | null) {
  if (!value) return null;
  return value.replace(/\s+/g, " ").trim();
}

function tryParseJsonLd($: cheerio.CheerioAPI): ProductData {
  const script = $(`script[type="application/ld+json"]`);
  const result: ProductData = {
    name: null,
    price: null,
    description: null,
    currency: null,
  };

  script.each((_, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed["@graph"])
          ? parsed["@graph"]
          : [parsed];

      for (const node of nodes) {
        if (
          node?.["@type"] === "Product" ||
          (Array.isArray(node?.["@type"]) && node["@type"].includes("Product"))
        ) {
          result.name = cleanText(node.name) ?? result.name;
          result.description =
            cleanText(node.description) ?? result.description;

          const offers = Array.isArray(node.offers)
            ? node.offers[0]
            : node.offers;

          result.price =
            cleanText(
              offers?.price?.toString?.() ?? node?.price?.toString?.(),
            ) ?? result.price;
          result.currency =
            cleanText(offers?.priceCurrency ?? node?.priceCurrency) ??
            result.currency;
        }
      }
    } catch {
      return;
    }
  });

  return result;
}

function extractWithCheerio(html: string): ProductData {
  const $ = cheerio.load(html);
  const jsonLd = tryParseJsonLd($);

  const name =
    jsonLd.name ??
    cleanText($("meta[property='og:title']").attr("content")) ??
    cleanText($("title").text()) ??
    cleanText($("h1").first().text());

  const description =
    jsonLd.description ??
    cleanText($("meta[name='description']").attr("content")) ??
    cleanText($("[itemprop='description']").first().text()) ??
    cleanText($("p").first().text());

  const price =
    jsonLd.price ??
    cleanText($("[itemprop='price']").attr("content")) ??
    cleanText($("[itemprop='price']").text()) ??
    cleanText($(".price, .product-price, .sale-price").first().text());

  return {
    name,
    price,
    description,
    currency: jsonLd.currency,
  };
}

async function extractWithLLM(
  url: string,
  content: string,
): Promise<ProductData> {
  const response = await client.responses.create({
    model: "gpt-4.1-nano",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "Extract product data from webpage text. Return only the final structured result.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `URL: ${url}\n\nPAGE CONTENT:\n${content.slice(0, 12000)}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "product_extraction",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: ["string", "null"] },
            price: { type: ["string", "null"] },
            description: { type: ["string", "null"] },
            currency: { type: ["string", "null"] },
          },
          required: ["name", "price", "description", "currency"],
        },
        strict: true,
      },
    },
  });

  return JSON.parse(response.output_text) as ProductData;
}

async function readTextWithLimit(response: Response, maxBytes: number) {
  if (!response.body) {
    return (await response.text()).slice(0, maxBytes);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    let chunk = value;
    if (totalBytes + value.byteLength > maxBytes) {
      chunk = value.subarray(0, maxBytes - totalBytes);
    }

    totalBytes += chunk.byteLength;
    text += decoder.decode(chunk, { stream: true });

    if (totalBytes >= maxBytes) {
      await reader.cancel();
      break;
    }
  }

  return text + decoder.decode();
}

async function fetchHtmlFromUrl(inputUrl: string) {
  let currentUrl = inputUrl;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const validation = await validatePublicHttpUrl(currentUrl);
    if (!validation.ok) {
      throw new RouteError(400, validation.code, validation.message);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(validation.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 ProductExtractorBot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has("location")
      ) {
        const location = response.headers.get("location");
        if (!location) {
          throw new RouteError(
            400,
            "EXTRACTION_FAILED",
            "Could not fetch that product page.",
          );
        }

        currentUrl = new URL(location, validation.url).toString();
        continue;
      }

      if (!response.ok) {
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "Could not fetch that product page.",
        );
      }

      const contentType = response.headers.get("content-type")?.toLowerCase();
      if (
        contentType &&
        !ALLOWED_CONTENT_TYPES.some((type) => contentType.includes(type))
      ) {
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "Only HTML product pages are supported.",
        );
      }

      const html = await readTextWithLimit(response, MAX_HTML_BYTES);
      if (!html.trim()) {
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "Could not read that product page.",
        );
      }

      return html;
    } catch (error) {
      if (error instanceof RouteError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "The product page took too long to respond.",
        );
      }

      throw new RouteError(
        500,
        "EXTRACTION_FAILED",
        "Failed to extract product details.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new RouteError(
    400,
    "EXTRACTION_FAILED",
    "Too many redirects while fetching the product page.",
  );
}

export async function POST(req: NextRequest) {
  try {
    const capabilities = await getCurrentUserCapabilities();
    if (!capabilities) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Please log in to use AI extraction.",
      );
    }

    if (!capabilities.canUseAiProductExtraction) {
      return createErrorResponse(
        403,
        "AI_EXTRACTION_NOT_ALLOWED",
        "This feature is available only to Pro beta users.",
      );
    }

    const rateLimitResult = await checkAiExtractRateLimit(capabilities.id);
    const rateLimitHeaders = rateLimitResult.enabled
      ? buildRateLimitHeaders(
          rateLimitResult.limit,
          rateLimitResult.remaining,
          rateLimitResult.reset,
        )
      : undefined;

    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      );

      return createErrorResponse(
        429,
        "RATE_LIMITED",
        "Too many extraction attempts. Please try again later.",
        {
          headers: {
            ...rateLimitHeaders,
            "Retry-After": String(retryAfterSeconds),
          },
          retryAfterSeconds,
        },
      );
    }

    let body: { url?: unknown };
    try {
      body = (await req.json()) as { url?: unknown };
    } catch {
      return createErrorResponse(400, "INVALID_URL", "Enter a valid product URL.");
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      return createErrorResponse(400, "INVALID_URL", "Enter a valid product URL.");
    }

    const url = body.url.trim();
    const validation = await validatePublicHttpUrl(url);
    if (!validation.ok) {
      return createErrorResponse(400, validation.code, validation.message);
    }

    const html = await fetchHtmlFromUrl(validation.url.toString());
    const basic = extractWithCheerio(html);

    const hasEnough = !!basic.name && !!basic.price && !!basic.description;
    if (hasEnough) {
      return NextResponse.json<ExtractSuccessResponse>(
        {
          source: "cheerio",
          product: basic,
        },
        {
          headers: rateLimitHeaders,
        },
      );
    }

    const $ = cheerio.load(html);
    const visibleText = $("body").text().replace(/\s+/g, " ").trim();
    const llmResult = await extractWithLLM(validation.url.toString(), visibleText);

    return NextResponse.json<ExtractSuccessResponse>(
      {
        source: "llm-fallback",
        product: {
          name: llmResult.name ?? basic.name,
          price: llmResult.price ?? basic.price,
          description: llmResult.description ?? basic.description,
          currency: llmResult.currency ?? basic.currency,
        },
      },
      {
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    if (error instanceof RouteError) {
      return createErrorResponse(error.status, error.code, error.message);
    }

    return createErrorResponse(
      500,
      "EXTRACTION_FAILED",
      "Failed to extract product details.",
    );
  }
}
