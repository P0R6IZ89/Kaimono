import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";
import { Readable } from "node:stream";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";

type PublicIpAddress = {
  address: string;
  family: 4 | 6;
};

type UrlValidationSuccess = {
  ok: true;
  url: URL;
  addresses: PublicIpAddress[];
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

const BLOCKED_IP_RANGES = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  BLOCKED_IP_RANGES.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  BLOCKED_IP_RANGES.addSubnet(network, prefix, "ipv6");
}

function normalizeHostname(hostname: string) {
  const normalized = hostname.replace(/\.$/, "").toLowerCase();

  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    return normalized.slice(1, -1);
  }

  return normalized;
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

function isPrivateOrLoopbackIp(ip: string): boolean {
  const family = isIP(ip);

  if (family === 4) {
    return BLOCKED_IP_RANGES.check(ip, "ipv4");
  }

  if (family === 6) {
    return BLOCKED_IP_RANGES.check(ip, "ipv6");
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

  const addressFamily = isIP(hostname);
  if (addressFamily === 4 || addressFamily === 6) {
    return {
      ok: true,
      url: parsed,
      addresses: [
        {
          address: hostname,
          family: addressFamily,
        },
      ],
    };
  }

  try {
    const addresses = (await lookup(hostname, {
      all: true,
      verbatim: true,
    })) as PublicIpAddress[];

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

    // The validated addresses are returned so the request can connect to one
    // of these exact IPs instead of performing a second, rebindable DNS lookup.
    return { ok: true, url: parsed, addresses };
  } catch {
    return {
      ok: false,
      code: "INVALID_URL",
      message: "Enter a valid product URL.",
    };
  }
}

type PublicHttpRequestInit = {
  headers?: HeadersInit;
  signal?: AbortSignal;
};

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

function decodeResponseBody(
  body: Readable,
  contentEncoding: string | null,
): { body: Readable; decoded: boolean } {
  const encodings =
    contentEncoding
      ?.split(",")
      .map((encoding) => encoding.trim().toLowerCase())
      .filter((encoding) => encoding && encoding !== "identity") ?? [];

  let decodedBody = body;

  // Encodings are listed in the order they were applied, so decode them in
  // reverse order. Most responses contain only one encoding.
  for (const encoding of encodings.reverse()) {
    if (encoding === "gzip" || encoding === "x-gzip") {
      decodedBody = decodedBody.pipe(createGunzip());
      continue;
    }

    if (encoding === "deflate") {
      decodedBody = decodedBody.pipe(createInflate());
      continue;
    }

    if (encoding === "br") {
      decodedBody = decodedBody.pipe(createBrotliDecompress());
      continue;
    }

    throw new Error(`Unsupported response content encoding: ${encoding}`);
  }

  return { body: decodedBody, decoded: encodings.length > 0 };
}

export async function requestValidatedPublicHttpUrl(
  validation: UrlValidationSuccess,
  init: PublicHttpRequestInit = {},
): Promise<Response> {
  const target = validation.addresses[0];
  if (!target) {
    throw new Error("The URL has no validated public address.");
  }

  const headers = new Headers(init.headers);
  headers.set("Host", validation.url.host);
  if (!headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip, deflate, br");
  }

  const isHttps = validation.url.protocol === "https:";
  const request = isHttps ? httpsRequest : httpRequest;
  const servername = normalizeHostname(validation.url.hostname);
  const tlsServername = isIP(servername) === 0 ? { servername } : {};

  return new Promise<Response>((resolve, reject) => {
    const outgoingRequest = request(
      {
        protocol: validation.url.protocol,
        hostname: target.address,
        family: target.family,
        port: validation.url.port || undefined,
        method: "GET",
        path: `${validation.url.pathname}${validation.url.search}`,
        headers: Object.fromEntries(headers.entries()),
        signal: init.signal,
        ...(isHttps ? tlsServername : {}),
      },
      (incomingResponse) => {
        try {
          const status = incomingResponse.statusCode ?? 500;
          const responseHeaders = new Headers();

          for (const [name, value] of Object.entries(
            incomingResponse.headers,
          )) {
            if (Array.isArray(value)) {
              for (const item of value) {
                responseHeaders.append(name, item);
              }
            } else if (value !== undefined) {
              responseHeaders.set(name, value);
            }
          }

          let body: ReadableStream<Uint8Array> | null = null;
          if (!NULL_BODY_STATUSES.has(status)) {
            const decodedResponse = decodeResponseBody(
              incomingResponse,
              responseHeaders.get("content-encoding"),
            );

            if (decodedResponse.decoded) {
              responseHeaders.delete("content-encoding");
              responseHeaders.delete("content-length");
            }

            body = Readable.toWeb(
              decodedResponse.body,
            ) as ReadableStream<Uint8Array>;
          }

          resolve(
            new Response(body, {
              status,
              statusText: incomingResponse.statusMessage,
              headers: responseHeaders,
            }),
          );
        } catch (error) {
          incomingResponse.destroy();
          reject(error);
        }
      },
    );

    outgoingRequest.on("error", reject);
    outgoingRequest.end();
  });
}
