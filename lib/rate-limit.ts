import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const AI_EXTRACT_LIMIT = 30;
const AI_EXTRACT_WINDOW = "1 h";
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW = "1 h";

export type RateLimitCheckResult = {
  enabled: boolean;
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let aiExtractRateLimit:
  | {
      limit: (identifier: string) => Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
      }>;
    }
  | null
  | undefined;

let contactRateLimit:
  | {
      limit: (identifier: string) => Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
      }>;
    }
  | null
  | undefined;

function getAiExtractRateLimit() {
  if (aiExtractRateLimit !== undefined) {
    return aiExtractRateLimit;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    aiExtractRateLimit = null;
    return aiExtractRateLimit;
  }

  const redis = new Redis({
    url,
    token,
  });

  aiExtractRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(AI_EXTRACT_LIMIT, AI_EXTRACT_WINDOW),
    analytics: true,
    prefix: "@to-buy-pj/ai-extract",
  });

  return aiExtractRateLimit;
}

function getContactRateLimit() {
  if (contactRateLimit !== undefined) {
    return contactRateLimit;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    contactRateLimit = null;
    return contactRateLimit;
  }

  const redis = new Redis({
    url,
    token,
  });

  contactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(CONTACT_LIMIT, CONTACT_WINDOW),
    analytics: true,
    prefix: "@to-buy-pj/contact",
  });

  return contactRateLimit;
}

export async function checkAiExtractRateLimit(
  userId: string,
): Promise<RateLimitCheckResult> {
  const rateLimit = getAiExtractRateLimit();

  if (!rateLimit) {
    return {
      enabled: false,
      success: true,
      limit: AI_EXTRACT_LIMIT,
      remaining: AI_EXTRACT_LIMIT,
      reset: Date.now(),
    };
  }

  const result = await rateLimit.limit(`ai-extract:user:${userId}`);

  return {
    enabled: true,
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function checkContactRateLimit(
  userId: string,
): Promise<RateLimitCheckResult> {
  const rateLimit = getContactRateLimit();

  if (!rateLimit) {
    return {
      enabled: false,
      success: true,
      limit: CONTACT_LIMIT,
      remaining: CONTACT_LIMIT,
      reset: Date.now(),
    };
  }

  const result = await rateLimit.limit(`contact:user:${userId}`);

  return {
    enabled: true,
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
