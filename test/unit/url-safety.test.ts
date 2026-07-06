import { lookup } from "node:dns/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { validatePublicHttpUrl } from "@/lib/url-safety";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

const lookupMock = vi.mocked(lookup);

type LookupAllResult = Array<{ address: string; family: 4 | 6 }>;

function mockLookupResult(addresses: LookupAllResult) {
  lookupMock.mockResolvedValue(
    addresses as unknown as Awaited<ReturnType<typeof lookup>>,
  );
}

describe("validatePublicHttpUrl", () => {
  beforeEach(() => {
    lookupMock.mockReset();
  });

  it("accepts a public HTTP URL when DNS resolves to a public IP", async () => {
    mockLookupResult([{ address: "93.184.216.34", family: 4 }]);

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error("Expected URL to be valid.");
    }

    expect(result.url.href).toBe("https://example.com/product");
    expect(lookupMock).toHaveBeenCalledWith("example.com", {
      all: true,
      verbatim: true,
    });
  });

  it.each([
    {
      caseName: "plain text",
      url: "not-a-url",
    },
    {
      caseName: "relative path",
      url: "/products/1",
    },
    {
      caseName: "missing hostname",
      url: "https://",
    },
  ])("rejects invalid URL syntax: $caseName", async ({ url }) => {
    const result = await validatePublicHttpUrl(url);

    expect(result).toMatchObject({
      ok: false,
      code: "INVALID_URL",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it.each([
    "ftp://example.com/file",
    "file:///etc/passwd",
    "mailto:test@example.com",
    "javascript:alert(1)",
  ])("rejects non-http protocol: %s", async (url) => {
    const result = await validatePublicHttpUrl(url);

    expect(result).toMatchObject({
      ok: false,
      code: "INVALID_URL",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it.each([
    "https://user@example.com/product",
    "https://user:password@example.com/product",
  ])("blocks URLs with credentials: %s", async (url) => {
    const result = await validatePublicHttpUrl(url);

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it.each([
    "http://localhost/product",
    "http://app.localhost/product",
    "http://host.docker.internal/product",
    "http://printer.local/product",
    "http://service.internal/product",
    "http://router.home/product",
    "http://device.lan/product",
  ])("blocks private or local hostnames: %s", async (url) => {
    const result = await validatePublicHttpUrl(url);

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it.each([
    "http://0.0.0.0/product",
    "http://10.0.0.1/product",
    "http://127.0.0.1/product",
    "http://100.64.0.1/product",
    "http://169.254.1.1/product",
    "http://172.16.0.1/product",
    "http://172.31.255.255/product",
    "http://192.168.1.1/product",
  ])("blocks private IPv4 addresses: %s", async (url) => {
    const result = await validatePublicHttpUrl(url);

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("blocks when DNS resolves to a private IPv4 address", async () => {
    mockLookupResult([{ address: "192.168.1.10", family: 4 }]);

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
  });

  it("blocks when any DNS result resolves to a private address", async () => {
    mockLookupResult([
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.5", family: 4 },
    ]);

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
  });

  it("blocks when DNS resolves to an IPv4-mapped private IPv6 address", async () => {
    mockLookupResult([{ address: "::ffff:192.168.1.10", family: 6 }]);

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
  });

  it("blocks when DNS returns no addresses", async () => {
    mockLookupResult([]);

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result).toMatchObject({
      ok: false,
      code: "BLOCKED_URL",
    });
  });

  it("returns INVALID_URL when DNS lookup fails", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));

    const result = await validatePublicHttpUrl("https://example.com/product");

    expect(result).toMatchObject({
      ok: false,
      code: "INVALID_URL",
    });
  });

  it("normalizes trailing dots before DNS lookup", async () => {
    mockLookupResult([{ address: "93.184.216.34", family: 4 }]);

    const result = await validatePublicHttpUrl("https://example.com./product");

    expect(result.ok).toBe(true);
    expect(lookupMock).toHaveBeenCalledWith("example.com", {
      all: true,
      verbatim: true,
    });
  });
});
