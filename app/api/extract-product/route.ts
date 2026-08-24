import OpenAI from "openai";
import * as cheerio from "cheerio";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserCapabilities } from "@/actions/userActions";
import { deductAiExtractionCredit } from "@/lib/ai-credits";
import { checkAiExtractRateLimit } from "@/lib/rate-limit";
import {
  requestValidatedPublicHttpUrl,
  validatePublicHttpUrl,
} from "@/lib/url-safety";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 2_000_000;
const MAX_IMAGE_BYTES = 5_000_000;
const ALLOWED_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];
const PRODUCT_IMAGE_FOLDER = "product-extractions";

type ProductData = {
  name: string | null;
  price: string | null;
  description: string | null;
  currency: string | null;
  image: string | null;
};

type ProductTextData = Omit<ProductData, "image">;

type ExtractSuccessResponse = {
  source: string;
  product: ProductData;
  creditsRemaining: number;
};

type ExtractErrorCode =
  | "UNAUTHORIZED"
  | "AI_EXTRACTION_NOT_ALLOWED"
  | "AI_CREDITS_REQUIRED"
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
    debugId?: string;
    debugStage?: string;
  },
) {
  return NextResponse.json(
    {
      code,
      error,
      ...(typeof init?.retryAfterSeconds === "number"
        ? { retryAfterSeconds: init.retryAfterSeconds }
        : {}),
      ...(init?.debugId ? { debugId: init.debugId } : {}),
      ...(init?.debugStage ? { debugStage: init.debugStage } : {}),
    },
    {
      status,
      headers: {
        ...init?.headers,
      },
    },
  );
}

function buildRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number,
) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(remaining, 0)),
    "X-RateLimit-Reset": String(reset),
  };
}

function buildCreditHeaders(creditsRemaining: number) {
  return {
    "X-AI-Credits-Remaining": String(Math.max(creditsRemaining, 0)),
  };
}

function cleanText(value?: string | null) {
  if (!value) return null;
  return value.replace(/\s+/g, " ").trim();
}

function resolveImageUrl(value: string | null | undefined, baseUrl: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned, baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function extractJsonLdImageValue(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const image = extractJsonLdImageValue(item);
      if (image) return image;
    }
    return null;
  }

  if (typeof value === "object") {
    const image = value as {
      url?: unknown;
      contentUrl?: unknown;
      "@id"?: unknown;
    };

    if (typeof image.url === "string") return image.url;
    if (typeof image.contentUrl === "string") return image.contentUrl;
    if (typeof image["@id"] === "string") return image["@id"];
  }

  return null;
}

function tryParseJsonLd($: cheerio.CheerioAPI, baseUrl: string): ProductData {
  const script = $(`script[type="application/ld+json"]`);
  const result: ProductData = {
    name: null,
    price: null,
    description: null,
    currency: null,
    image: null,
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
          result.image =
            resolveImageUrl(extractJsonLdImageValue(node.image), baseUrl) ??
            result.image;
        }
      }
    } catch {
      return;
    }
  });

  return result;
}

function extractWithCheerio(html: string, baseUrl: string): ProductData {
  const $ = cheerio.load(html);
  const jsonLd = tryParseJsonLd($, baseUrl);

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

  const itempropImage =
    $("[itemprop='image']").first().attr("content") ??
    $("[itemprop='image']").first().attr("src");
  const image =
    jsonLd.image ??
    resolveImageUrl($("meta[property='og:image']").attr("content"), baseUrl) ??
    resolveImageUrl($("meta[name='twitter:image']").attr("content"), baseUrl) ??
    resolveImageUrl(itempropImage, baseUrl) ??
    resolveImageUrl($("link[rel='image_src']").attr("href"), baseUrl);

  return {
    name,
    price,
    description,
    currency: jsonLd.currency,
    image,
  };
}

async function extractWithLLM(
  url: string,
  content: string,
): Promise<ProductTextData> {
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

  return JSON.parse(response.output_text) as ProductTextData;
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

async function readBufferWithLimit(response: Response, maxBytes: number) {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error("Image is too large.");
  }

  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > maxBytes) {
      throw new Error("Image is too large.");
    }
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("Image is too large.");
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
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
      const response = await requestValidatedPublicHttpUrl(validation, {
        headers: {
          "User-Agent": "Mozilla/5.0 ProductExtractorBot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has("location")
      ) {
        const location = response.headers.get("location");
        if (!location) {
          await response.body?.cancel();
          throw new RouteError(
            400,
            "EXTRACTION_FAILED",
            "Could not fetch that product page.",
          );
        }

        await response.body?.cancel();
        currentUrl = new URL(location, validation.url).toString();
        continue;
      }

      if (!response.ok) {
        await response.body?.cancel();
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
        await response.body?.cancel();
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
      return {
        html,
        finalUrl: validation.url.toString(),
      };
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

async function fetchImageFromUrl(inputUrl: string) {
  let currentUrl = inputUrl;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    const validation = await validatePublicHttpUrl(currentUrl);
    if (!validation.ok) {
      throw new Error(validation.message);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await requestValidatedPublicHttpUrl(validation, {
        headers: {
          "User-Agent": "Mozilla/5.0 ProductExtractorBot/1.0",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
        signal: controller.signal,
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has("location")
      ) {
        const location = response.headers.get("location");
        if (!location) {
          await response.body?.cancel();
          throw new Error("Image redirect is missing a location header.");
        }

        await response.body?.cancel();
        currentUrl = new URL(location, validation.url).toString();
        continue;
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Image request failed with status ${response.status}.`);
      }

      const contentType = response.headers.get("content-type")?.toLowerCase();
      if (!contentType?.startsWith("image/")) {
        await response.body?.cancel();
        throw new Error("Image URL did not return an image content type.");
      }

      return {
        buffer: await readBufferWithLimit(response, MAX_IMAGE_BYTES),
        contentType: contentType.split(";")[0],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Too many redirects while fetching the product image.");
}

async function importProductImage(imageUrl: string | null) {
  if (!imageUrl) return null;

  try {
    const validation = await validatePublicHttpUrl(imageUrl);
    if (!validation.ok) {
      return null;
    }

    const image = await fetchImageFromUrl(validation.url.toString());
    const dataUri = `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
    const upload = await cloudinary.uploader.upload(dataUri, {
      folder: PRODUCT_IMAGE_FOLDER,
      resource_type: "image",
    });

    return upload.secure_url ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const debugId = randomUUID();
  let debugStage = "capabilities";

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
        402,
        "AI_CREDITS_REQUIRED",
        "Add AI extraction credits to use this feature.",
        {
          headers: buildCreditHeaders(capabilities.aiCreditBalance),
        },
      );
    }

    debugStage = "rate-limit";
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

    debugStage = "request-body";
    let body: { url?: unknown };
    try {
      body = (await req.json()) as { url?: unknown };
    } catch {
      return createErrorResponse(
        400,
        "INVALID_URL",
        "Enter a valid product URL.",
      );
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      return createErrorResponse(
        400,
        "INVALID_URL",
        "Enter a valid product URL.",
      );
    }

    debugStage = "url-validation";
    const url = body.url.trim();
    const validation = await validatePublicHttpUrl(url);
    if (!validation.ok) {
      return createErrorResponse(400, validation.code, validation.message);
    }

    debugStage = "html-fetch";
    const { html, finalUrl } = await fetchHtmlFromUrl(
      validation.url.toString(),
    );

    debugStage = "cheerio-extraction";
    const basic = extractWithCheerio(html, finalUrl);

    debugStage = "image-import";
    const productImage = await importProductImage(basic.image);
    const basicWithImage: ProductData = {
      ...basic,
      image: productImage,
    };

    const hasEnough =
      !!basicWithImage.name &&
      !!basicWithImage.price &&
      !!basicWithImage.description;
    if (hasEnough) {
      debugStage = "credit-deduction-cheerio";
      const creditResult = await deductAiExtractionCredit(capabilities.id);
      if (!creditResult.ok) {
        return createErrorResponse(
          402,
          "AI_CREDITS_REQUIRED",
          "Add AI extraction credits to use this feature.",
          {
            headers: buildCreditHeaders(creditResult.balance),
          },
        );
      }

      debugStage = "cheerio-response";
      return NextResponse.json<ExtractSuccessResponse>(
        {
          source: "cheerio",
          product: basicWithImage,
          creditsRemaining: creditResult.balance,
        },
        {
          headers: {
            ...rateLimitHeaders,
            ...buildCreditHeaders(creditResult.balance),
          },
        },
      );
    }

    debugStage = "llm-input";
    const $ = cheerio.load(html);
    const visibleText = $("body").text().replace(/\s+/g, " ").trim();

    debugStage = "llm-extraction";
    const llmResult = await extractWithLLM(finalUrl, visibleText);

    debugStage = "credit-deduction-llm";
    const creditResult = await deductAiExtractionCredit(capabilities.id);
    if (!creditResult.ok) {
      return createErrorResponse(
        402,
        "AI_CREDITS_REQUIRED",
        "Add AI extraction credits to use this feature.",
        {
          headers: buildCreditHeaders(creditResult.balance),
        },
      );
    }

    debugStage = "llm-response";
    return NextResponse.json<ExtractSuccessResponse>(
      {
        source: "llm-fallback",
        product: {
          name: llmResult.name ?? basicWithImage.name,
          price: llmResult.price ?? basicWithImage.price,
          description: llmResult.description ?? basicWithImage.description,
          currency: llmResult.currency ?? basicWithImage.currency,
          image: basicWithImage.image,
        },
        creditsRemaining: creditResult.balance,
      },
      {
        headers: {
          ...rateLimitHeaders,
          ...buildCreditHeaders(creditResult.balance),
        },
      },
    );
  } catch (error) {
    if (error instanceof RouteError) {
      if (error.status >= 500) {
        console.error("[ai-extract]", {
          debugId,
          debugStage,
          error,
        });
      }

      return createErrorResponse(error.status, error.code, error.message, {
        ...(error.status >= 500 ? { debugId, debugStage } : {}),
      });
    }

    console.error("[ai-extract]", {
      debugId,
      debugStage,
      error,
    });

    return createErrorResponse(
      500,
      "EXTRACTION_FAILED",
      "Failed to extract product details.",
      {
        debugId,
        debugStage,
      },
    );
  }
}
