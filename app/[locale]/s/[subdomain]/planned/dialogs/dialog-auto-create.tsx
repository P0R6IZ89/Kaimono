"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Wand2, X } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
};

type ExtractProductErrorResponse = {
  code?: string;
  error?: string;
  retryAfterSeconds?: number;
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
  const [isOpen, setIsOpen] = useState(true);
  const hasUrl = url.trim().length > 0;

  const getErrorMessage = (data: ExtractProductErrorResponse) => {
    switch (data.code) {
      case "UNAUTHORIZED":
        return t("ai.loginRequired");
      case "AI_EXTRACTION_NOT_ALLOWED":
        return t("ai.proBetaOnly");
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
        setError(getErrorMessage(data as ExtractProductErrorResponse));
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

      setStatus(
        normalizedProduct.name &&
          normalizedProduct.description &&
          normalizedProduct.price
          ? t("ai.extractComplete")
          : t("ai.partialExtract"),
      );
    } catch {
      setError(t("ai.extractFailed"));
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Field>
        <CollapsibleTrigger asChild>
          <FieldLabel htmlFor="input-group-url">
            <Badge className="bg-amber-300 text-background">Beta</Badge>
            {t("ai.label")}
            <ChevronDown
              className={`size-4 text-muted-foreground transition duration-300 ease-in-out ${isOpen ? "rotate-180" : null}`}
            />
          </FieldLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <InputGroup>
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
              <InputGroupButton
                variant={hasUrl ? "default" : "secondary"}
                size="icon-xs"
                onClick={() => void handleExtract()}
                disabled={isExtracting}
                className={
                  hasUrl
                    ? "shadow-sm transition-[color,box-shadow,background-color] text-primary-foreground"
                    : "text-muted-foreground transition-[color,box-shadow,background-color]"
                }
                aria-label="Extract product"
              >
                {isExtracting ? (
                  <Wand2 className="animate-spin" />
                ) : (
                  <Wand2 className={hasUrl ? "opacity-100" : "opacity-75"} />
                )}
              </InputGroupButton>
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
                  aria-label="Clear URL"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X />
                </InputGroupButton>
              ) : null}
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription className="pt-2">
            {status ?? t("ai.description")}
          </FieldDescription>
          <FieldError>{error}</FieldError>
        </CollapsibleContent>
      </Field>
    </Collapsible>
  );
}
