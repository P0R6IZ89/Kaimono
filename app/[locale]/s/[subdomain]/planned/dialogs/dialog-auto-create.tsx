"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AI_EXTRACTION_CREDIT_COST } from "@/lib/ai-credits";

type ExtractedProduct = {
  name: string | null;
  price: string | null;
  description: string | null;
  currency: string | null;
  image: string | null;
};

type ExtractProductResponse = {
  source: string;
  product: ExtractedProduct;
  creditsRemaining: number;
};

type ExtractProductErrorResponse = {
  code?: string;
  error?: string;
  retryAfterSeconds?: number;
  debugId?: string;
  debugStage?: string;
};

type AiCreditsResponse = {
  credits: number;
};

type AutoCreateFormProps = {
  onExtracted: (payload: {
    url: string;
    source: string;
    product: ExtractedProduct;
  }) => void;
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeExtractedPrice(value?: string | null) {
  if (!value) return null;

  const sanitized = value.replace(/[^\d,.-]/g, "").trim();
  if (!sanitized) return null;

  let normalized = sanitized;

  if (sanitized.includes(",") && sanitized.includes(".")) {
    const lastComma = sanitized.lastIndexOf(",");
    const lastDot = sanitized.lastIndexOf(".");
    normalized =
      lastComma > lastDot
        ? sanitized.replace(/\./g, "").replace(",", ".")
        : sanitized.replace(/,/g, "");
  } else if (sanitized.includes(",")) {
    const parts = sanitized.split(",");
    normalized =
      parts.length === 2 && parts[1].length <= 2
        ? `${parts[0].replace(/,/g, "")}.${parts[1]}`
        : sanitized.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return normalized;
}

export function AutoCreateForm({ onExtracted }: AutoCreateFormProps) {
  const t = useTranslations("Planned");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const hasUrl = url.trim().length > 0;

  useEffect(() => {
    let isMounted = true;

    async function loadCredits() {
      try {
        const response = await fetch("/api/ai-credits");
        if (!response.ok) return;

        const data = (await response.json()) as AiCreditsResponse;
        if (isMounted) {
          setCredits(data.credits);
        }
      } catch {
        return;
      }
    }

    void loadCredits();

    return () => {
      isMounted = false;
    };
  }, []);

  const getErrorMessage = (data: ExtractProductErrorResponse) => {
    switch (data.code) {
      case "UNAUTHORIZED":
        return t("ai.loginRequired");
      case "AI_EXTRACTION_NOT_ALLOWED":
      case "AI_CREDITS_REQUIRED":
        return t("ai.creditsRequired");
      case "BLOCKED_URL":
        return t("ai.blockedUrl");
      case "INVALID_URL":
        return t("ai.invalidUrl");
      case "RATE_LIMITED":
        return t("ai.rateLimited");
      default:
        return data.error || t("ai.extractFailed");
    }
  };

  const handleExtract = async () => {
    const trimmedUrl = url.trim();

    if (!isValidUrl(trimmedUrl)) {
      setError(t("ai.invalidUrl"));
      setStatus(null);
      return;
    }

    setIsExtracting(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/extract-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = (await response.json()) as
        | ExtractProductResponse
        | ExtractProductErrorResponse;

      if (!response.ok) {
        const remaining = response.headers.get("X-AI-Credits-Remaining");
        if (remaining !== null) {
          setCredits(Number(remaining));
        }
        const errorData = data as ExtractProductErrorResponse;
        console.error("[ai-extract]", {
          status: response.status,
          code: errorData.code,
          debugId: errorData.debugId,
          debugStage: errorData.debugStage,
          error: errorData.error,
        });
        const errorMessage = getErrorMessage(errorData);
        setError(
          errorData.debugId
            ? `${errorMessage} Debug: ${errorData.debugId}/${errorData.debugStage ?? "unknown"}`
            : errorMessage,
        );
        return;
      }

      if (!("product" in data)) {
        setError(t("ai.extractFailed"));
        return;
      }

      const normalizedPrice = normalizeExtractedPrice(data.product.price);
      const normalizedProduct: ExtractedProduct = {
        ...data.product,
        price: normalizedPrice,
      };

      onExtracted({
        url: trimmedUrl,
        source: data.source,
        product: normalizedProduct,
      });
      setCredits(data.creditsRemaining);

      setStatus(
        normalizedProduct.name &&
          normalizedProduct.description &&
          normalizedProduct.price
          ? t("ai.extractComplete")
          : t("ai.partialExtract"),
      );
    } catch (error) {
      console.error("[ai-extract]", {
        error,
      });
      setError(t("ai.extractFailed"));
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <section className="rounded-lg border border-primary/40 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/40 text-background shadow-sm">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={"outline"}>{t("ai.beta")}</Badge>
            <h3 className="text-base font-semibold leading-tight">
              {t("ai.label")}
            </h3>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {t("ai.description")}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <label
            htmlFor="input-group-url"
            className="text-sm font-medium leading-none"
          >
            {t("fields.link")}
          </label>
          <InputGroup className="bg-background/80">
            <InputGroupAddon>
              <Link2 className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="input-group-url"
              type="url"
              value={url}
              placeholder={t("ai.placeholder")}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={!!error}
              disabled={isExtracting}
            />
            <InputGroupAddon align="inline-end">
              {hasUrl ? (
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setUrl("");
                    setError(null);
                    setStatus(null);
                  }}
                  disabled={isExtracting}
                  aria-label={t("ai.clearUrl")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X />
                </InputGroupButton>
              ) : null}
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() => void handleExtract()}
          disabled={!hasUrl || isExtracting}
        >
          {isExtracting ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {t("ai.generateDetails")} · {t("ai.creditCost", { count: 10 })}
        </Button>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{status ?? t("ai.reviewHint")}</span>
          <span>
            {credits === null
              ? t("ai.creditsLoading")
              : t("ai.creditsRemaining", { count: credits })}
          </span>
        </div>
        <FieldError>{error}</FieldError>
      </div>
    </section>
  );
}
