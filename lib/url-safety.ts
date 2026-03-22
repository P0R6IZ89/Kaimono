import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

type UrlValidationSuccess = {
  ok: true;
  url: URL;
};

type UrlValidationFailure = {
  ok: false;
  code: "INVALID_URL" | "BLOCKED_URL";
  message: string;
};

export type UrlValidationResult = UrlValidationSuccess | UrlValidationFailure;

const BLOCKED_HOST_SUFFIXES = [
  ".local",
  ".localhost",
  ".internal",
  ".home",
  ".lan",
];

function normalizeHostname(hostname: string) {
  return hostname.replace(/\.$/, "").toLowerCase();
}

function isBlockedHostname(hostname: string) {
  if (!hostname) return true;

  if (
    hostname === "localhost" ||
    hostname === "host.docker.internal" ||
    hostname.endsWith(".localhost")
  ) {
    return true;
  }

  return BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

function isPrivateIpv4(ip: string): boolean {
  const octets = ip.split(".").map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === "::" || normalized === "::1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isPrivateOrLoopbackIp(normalized.slice(7));
  }

  return (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

function isPrivateOrLoopbackIp(ip: string): boolean {
  const family = isIP(ip);

  if (family === 4) {
    return isPrivateIpv4(ip);
  }

  if (family === 6) {
    return isPrivateIpv6(ip);
  }

  return false;
}

export async function validatePublicHttpUrl(
  rawUrl: string,
): Promise<UrlValidationResult> {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      ok: false,
      code: "INVALID_URL",
      message: "Enter a valid product URL.",
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      ok: false,
      code: "INVALID_URL",
      message: "Enter a valid product URL.",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      ok: false,
      code: "BLOCKED_URL",
      message: "This URL is not allowed.",
    };
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (isBlockedHostname(hostname)) {
    return {
      ok: false,
      code: "BLOCKED_URL",
      message: "This URL is not allowed.",
    };
  }

  if (isPrivateOrLoopbackIp(hostname)) {
    return {
      ok: false,
      code: "BLOCKED_URL",
      message: "This URL is not allowed.",
    };
  }

  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true });

    if (
      addresses.length === 0 ||
      addresses.some((address) => isPrivateOrLoopbackIp(address.address))
    ) {
      return {
        ok: false,
        code: "BLOCKED_URL",
        message: "This URL is not allowed.",
      };
    }
  } catch {
    return {
      ok: false,
      code: "INVALID_URL",
      message: "Enter a valid product URL.",
    };
  }

  return { ok: true, url: parsed };
}
