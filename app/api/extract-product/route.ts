import OpenAI from "openai";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserCapabilities } from "@/actions/userActions";
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
    console.log("[extract-product] Fetch attempt", {
      attempt: attempt + 1,
      url: currentUrl,
    });

    const validation = await validatePublicHttpUrl(currentUrl);
    if (!validation.ok) {
      console.error("[extract-product] URL validation failed during fetch", {
        url: currentUrl,
        code: validation.code,
        message: validation.message,
      });
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
          console.error("[extract-product] Redirect missing location header", {
            url: validation.url,
            status: response.status,
          });
          throw new RouteError(
            400,
            "EXTRACTION_FAILED",
            "Could not fetch that product page.",
          );
        }

        currentUrl = new URL(location, validation.url).toString();
        console.log("[extract-product] Following redirect", {
          from: validation.url.toString(),
          to: currentUrl,
          status: response.status,
        });
        continue;
      }

      if (!response.ok) {
        console.error("[extract-product] Fetch returned non-ok response", {
          url: validation.url.toString(),
          status: response.status,
        });
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
        console.error("[extract-product] Unsupported content type", {
          url: validation.url.toString(),
          contentType,
        });
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "Only HTML product pages are supported.",
        );
      }

      const html = await readTextWithLimit(response, MAX_HTML_BYTES);
      if (!html.trim()) {
        console.error("[extract-product] Empty HTML response body", {
          url: validation.url.toString(),
        });
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "Could not read that product page.",
        );
      }

      console.log("[extract-product] HTML fetched successfully", {
        url: validation.url.toString(),
        bytes: html.length,
      });
      return {
        html,
        finalUrl: validation.url.toString(),
      };
    } catch (error) {
      if (error instanceof RouteError) {
        console.error("[extract-product] Route error during fetch", {
          url: currentUrl,
          status: error.status,
          code: error.code,
          message: error.message,
        });
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        console.error("[extract-product] Fetch timed out", {
          url: currentUrl,
          timeoutMs: FETCH_TIMEOUT_MS,
        });
        throw new RouteError(
          400,
          "EXTRACTION_FAILED",
          "The product page took too long to respond.",
        );
      }

      console.error("[extract-product] Unexpected fetch failure", {
        url: currentUrl,
        error,
      });
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
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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

async function importProductImage(imageUrl: string | null) {
  if (!imageUrl) return null;

  try {
    const validation = await validatePublicHttpUrl(imageUrl);
    if (!validation.ok) {
      console.error("[extract-product] Product image URL validation failed", {
        url: imageUrl,
        code: validation.code,
        message: validation.message,
      });
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
    console.error("[extract-product] Product image import failed", {
      url: imageUrl,
      error,
    });
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const capabilities = await getCurrentUserCapabilities();
    if (!capabilities) {
      console.error("[extract-product] Unauthorized extraction attempt");
      return createErrorResponse(
        401,
        "UNAUTHORIZED",
        "Please log in to use AI extraction.",
      );
    }

    if (!capabilities.canUseAiProductExtraction) {
      console.error("[extract-product] Extraction not allowed for user", {
        userId: capabilities.id,
      });
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

      console.error("[extract-product] Rate limit exceeded", {
        userId: capabilities.id,
        retryAfterSeconds,
      });
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
    } catch (error) {
      console.error("[extract-product] Failed to parse request body", {
        userId: capabilities.id,
        error,
      });
      return createErrorResponse(400, "INVALID_URL", "Enter a valid product URL.");
    }

    if (typeof body.url !== "string" || !body.url.trim()) {
      console.error("[extract-product] Missing or invalid URL in request body", {
        userId: capabilities.id,
        url: body.url,
      });
      return createErrorResponse(400, "INVALID_URL", "Enter a valid product URL.");
    }

    const url = body.url.trim();
    console.log("[extract-product] Starting extraction request", {
      userId: capabilities.id,
      url,
    });
    const validation = await validatePublicHttpUrl(url);
    if (!validation.ok) {
      console.error("[extract-product] URL validation failed", {
        userId: capabilities.id,
        url,
        code: validation.code,
        message: validation.message,
      });
      return createErrorResponse(400, validation.code, validation.message);
    }

    const { html, finalUrl } = await fetchHtmlFromUrl(validation.url.toString());
    const basic = extractWithCheerio(html, finalUrl);
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
      console.log("[extract-product] Extracted with cheerio", {
        url: finalUrl,
      });
      return NextResponse.json<ExtractSuccessResponse>(
        {
          source: "cheerio",
          product: basicWithImage,
        },
        {
          headers: rateLimitHeaders,
        },
      );
    }

    const $ = cheerio.load(html);
    const visibleText = $("body").text().replace(/\s+/g, " ").trim();
    console.log("[extract-product] Falling back to LLM extraction", {
      url: finalUrl,
      visibleTextLength: visibleText.length,
    });
    const llmResult = await extractWithLLM(finalUrl, visibleText);

    console.log("[extract-product] Extracted with LLM fallback", {
      url: finalUrl,
    });
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
      },
      {
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    if (error instanceof RouteError) {
      console.error("[extract-product] Route handler failed with known error", {
        status: error.status,
        code: error.code,
        message: error.message,
      });
      return createErrorResponse(error.status, error.code, error.message);
    }

    console.error("[extract-product] Route handler failed with unexpected error", {
      error,
    });
    return createErrorResponse(
      500,
      "EXTRACTION_FAILED",
      "Failed to extract product details.",
    );
  }
}
