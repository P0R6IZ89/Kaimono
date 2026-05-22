import OpenAI from "openai";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserCapabilities } from "@/actions/userActions";
import { deductAiExtractionCredit } from "@/lib/ai-credits";
import { checkAiExtractRateLimit } from "@/lib/rate-limit";
import { validatePublicHttpUrl } from "@/lib/url-safety";
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
const AI_EXTRACT_DEBUG = process.env.AI_EXTRACT_DEBUG === "true";

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

type ExtractDebugStage =
  | "start"
  | "capabilities"
  | "credits"
  | "rate_limit"
  | "parse_body"
  | "validate_url"
  | "fetch_html"
  | "cheerio"
  | "image_import"
  | "llm"
  | "deduct_credit"
  | "response"
  | "route_error"
  | "unexpected_error";

type ExtractDebugContext = {
  requestId: string;
  stage: ExtractDebugStage;
};

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
    debug?: ExtractDebugContext;
  },
) {
  return NextResponse.json(
    {
      code,
      error,
      ...(init?.debug
        ? { debugId: init.debug.requestId, debugStage: init.debug.stage }
        : {}),
      ...(typeof init?.retryAfterSeconds === "number"
        ? { retryAfterSeconds: init.retryAfterSeconds }
        : {}),
    },
    {
      status,
      headers: {
        ...init?.headers,
        ...(init?.debug
          ? {
              "X-AI-Extract-Debug-Id": init.debug.requestId,
              "X-AI-Extract-Stage": init.debug.stage,
            }
          : {}),
      },
    },
  );
}

function createRequestId() {
  return crypto.randomUUID();
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: AI_EXTRACT_DEBUG ? error.stack : undefined,
    };
  }

  return { message: String(error) };
}

function safeUrlForDebug(value: string) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return "invalid-url";
  }
}

function logExtractDebug(
  ctx: ExtractDebugContext,
  message: string,
  details?: Record<string, unknown>,
) {
  if (!AI_EXTRACT_DEBUG) return;

  console.info("[ai-extract]", {
    requestId: ctx.requestId,
    stage: ctx.stage,
    message,
    ...details,
  });
}

function logExtractError(
  ctx: ExtractDebugContext,
  message: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  console.error("[ai-extract]", {
    requestId: ctx.requestId,
    stage: ctx.stage,
    message,
    error: getErrorDetails(error),
    ...details,
  });
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
      const response = await fetch(validation.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 ProductExtractorBot/1.0",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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
          throw new Error("Image redirect is missing a location header.");
        }

        currentUrl = new URL(location, validation.url).toString();
        continue;
      }

      if (!response.ok) {
        throw new Error(`Image request failed with status ${response.status}.`);
      }

      const contentType = response.headers.get("content-type")?.toLowerCase();
      if (!contentType?.startsWith("image/")) {
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

async function importProductImage(
  imageUrl: string | null,
  ctx: ExtractDebugContext,
) {
  if (!imageUrl) return null;

  try {
    const validation = await validatePublicHttpUrl(imageUrl);
    if (!validation.ok) {
      logExtractError(
        ctx,
        "Product image URL failed public URL validation.",
        new Error(validation.message),
        {
          code: validation.code,
          imageUrl: safeUrlForDebug(imageUrl),
        },
      );
      return null;
    }

    const image = await fetchImageFromUrl(validation.url.toString());
    const dataUri = `data:${image.contentType};base64,${image.buffer.toString("base64")}`;
    const upload = await cloudinary.uploader.upload(dataUri, {
      folder: PRODUCT_IMAGE_FOLDER,
      resource_type: "image",
    });

    return upload.secure_url ?? null;
  } catch (error) {
    logExtractError(ctx, "Failed to import product image.", error, {
      imageUrl: safeUrlForDebug(imageUrl),
    });
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ctx: ExtractDebugContext = {
    requestId: createRequestId(),
    stage: "start",
  };

  try {
    logExtractDebug(ctx, "Extraction request started.");

    ctx.stage = "capabilities";
    const capabilities = await getCurrentUserCapabilities();
    if (!capabilities) {
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Please log in to use AI extraction.",
        { debug: ctx },
      );
    }
    logExtractDebug(ctx, "Loaded current user capabilities.", {
      userId: capabilities.id,
      aiCreditBalance: capabilities.aiCreditBalance,
      canUseAiProductExtraction: capabilities.canUseAiProductExtraction,
    });

    ctx.stage = "credits";
    if (!capabilities.canUseAiProductExtraction) {
      return createErrorResponse(
        402,
        "AI_CREDITS_REQUIRED",
        "Add AI extraction credits to use this feature.",
        {
          headers: buildCreditHeaders(capabilities.aiCreditBalance),
          debug: ctx,
        },
      );
    }

    ctx.stage = "rate_limit";
    const rateLimitResult = await checkAiExtractRateLimit(capabilities.id);
    const rateLimitHeaders = rateLimitResult.enabled
      ? buildRateLimitHeaders(
          rateLimitResult.limit,
          rateLimitResult.remaining,
          rateLimitResult.reset,
        )
      : undefined;
    logExtractDebug(ctx, "Checked rate limit.", {
      enabled: rateLimitResult.enabled,
      success: rateLimitResult.success,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    });

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
          debug: ctx,
        },
      );
    }

    ctx.stage = "parse_body";
    let body: { url?: unknown };
    try {
      body = (await req.json()) as { url?: unknown };
    } catch {
      return createErrorResponse(
        400,
        "INVALID_URL",
        "Enter a valid product URL.",
        { debug: ctx },
      );
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      return createErrorResponse(
        400,
        "INVALID_URL",
        "Enter a valid product URL.",
        { debug: ctx },
      );
    }

    ctx.stage = "validate_url";
    const url = body.url.trim();
    logExtractDebug(ctx, "Validating product URL.", {
      url: safeUrlForDebug(url),
    });
    const validation = await validatePublicHttpUrl(url);
    if (!validation.ok) {
      return createErrorResponse(400, validation.code, validation.message, {
        debug: ctx,
      });
    }

    ctx.stage = "fetch_html";
    const { html, finalUrl } = await fetchHtmlFromUrl(
      validation.url.toString(),
    );
    logExtractDebug(ctx, "Fetched product HTML.", {
      finalUrl: safeUrlForDebug(finalUrl),
      htmlLength: html.length,
    });

    ctx.stage = "cheerio";
    const basic = extractWithCheerio(html, finalUrl);
    logExtractDebug(ctx, "Extracted product with Cheerio.", {
      hasName: !!basic.name,
      hasPrice: !!basic.price,
      hasDescription: !!basic.description,
      hasImage: !!basic.image,
    });

    ctx.stage = "image_import";
    const productImage = await importProductImage(basic.image, ctx);
    const basicWithImage: ProductData = {
      ...basic,
      image: productImage,
    };
    logExtractDebug(ctx, "Imported product image.", {
      hadSourceImage: !!basic.image,
      importedImage: !!productImage,
    });

    const hasEnough =
      !!basicWithImage.name &&
      !!basicWithImage.price &&
      !!basicWithImage.description;
    if (hasEnough) {
      ctx.stage = "deduct_credit";
      const creditResult = await deductAiExtractionCredit(capabilities.id);
      if (!creditResult.ok) {
        return createErrorResponse(
          402,
          "AI_CREDITS_REQUIRED",
          "Add AI extraction credits to use this feature.",
          {
            headers: buildCreditHeaders(creditResult.balance),
            debug: ctx,
          },
        );
      }
      logExtractDebug(ctx, "Deducted AI credit.", {
        creditsRemaining: creditResult.balance,
      });

      ctx.stage = "response";
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
            "X-AI-Extract-Debug-Id": ctx.requestId,
            "X-AI-Extract-Stage": ctx.stage,
          },
        },
      );
    }

    ctx.stage = "llm";
    const $ = cheerio.load(html);
    const visibleText = $("body").text().replace(/\s+/g, " ").trim();
    logExtractDebug(ctx, "Falling back to LLM extraction.", {
      finalUrl: safeUrlForDebug(finalUrl),
      visibleTextLength: visibleText.length,
    });
    const llmResult = await extractWithLLM(finalUrl, visibleText);
    logExtractDebug(ctx, "LLM extraction completed.", {
      hasName: !!llmResult.name,
      hasPrice: !!llmResult.price,
      hasDescription: !!llmResult.description,
      hasCurrency: !!llmResult.currency,
    });

    ctx.stage = "deduct_credit";
    const creditResult = await deductAiExtractionCredit(capabilities.id);
    if (!creditResult.ok) {
      return createErrorResponse(
        402,
        "AI_CREDITS_REQUIRED",
        "Add AI extraction credits to use this feature.",
        {
          headers: buildCreditHeaders(creditResult.balance),
          debug: ctx,
        },
      );
    }
    logExtractDebug(ctx, "Deducted AI credit.", {
      creditsRemaining: creditResult.balance,
    });

    ctx.stage = "response";
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
          "X-AI-Extract-Debug-Id": ctx.requestId,
          "X-AI-Extract-Stage": ctx.stage,
        },
      },
    );
  } catch (error) {
    const failedStage = ctx.stage;
    if (error instanceof RouteError) {
      logExtractError(
        { ...ctx, stage: failedStage },
        "Handled extraction route error.",
        error,
        {
          handledStage: "route_error",
          status: error.status,
          code: error.code,
        },
      );
      return createErrorResponse(error.status, error.code, error.message, {
        debug: { ...ctx, stage: failedStage },
      });
    }

    logExtractError(
      { ...ctx, stage: failedStage },
      "Unhandled extraction error.",
      error,
      {
        handledStage: "unexpected_error",
      },
    );
    return createErrorResponse(
      500,
      "EXTRACTION_FAILED",
      "Failed to extract product details.",
      { debug: { ...ctx, stage: failedStage } },
    );
  }
}
