import { describe, expect, it } from "vitest";

import { extractSubdomainFromHost } from "@/lib/subdomain";

const rootDomainHost = "kaimono.app";

describe("extractSubdomainFromHost", () => {
  it.each([
    {
      caseName: "root localhost",
      host: "localhost:3000",
      expected: null,
    },
    {
      caseName: "localhost subdomain",
      host: "team.localhost:3000",
      expected: "team",
    },
    {
      caseName: "root production domain",
      host: "kaimono.app",
      expected: null,
    },
    {
      caseName: "www production domain",
      host: "www.kaimono.app",
      expected: null,
    },
    {
      caseName: "production subdomain",
      host: "team.kaimono.app",
      expected: "team",
    },
    {
      caseName: "host with uppercase letters",
      host: "TEAM.KAIMONO.APP",
      expected: "team",
    },
    {
      caseName: "production subdomain with port",
      host: "team.kaimono.app:3000",
      expected: "team",
    },
    {
      caseName: "Vercel preview deployment",
      host: "team---feature-branch.vercel.app",
      expected: "team",
    },
    {
      caseName: "unrelated domain",
      host: "example.com",
      expected: null,
    },
    {
      caseName: "suffix attack domain",
      host: "team.kaimono.app.example.com",
      expected: null,
    },
    {
      caseName: "empty host",
      host: "",
      expected: null,
    },
    {
      caseName: "nested production subdomain",
      host: "north.team.kaimono.app",
      expected: null,
    },
    {
      caseName: "subdomain with underscore",
      host: "my_team.kaimono.app",
      expected: null,
    },
    {
      caseName: "subdomain with leading hyphen",
      host: "-team.kaimono.app",
      expected: null,
    },
    {
      caseName: "subdomain with trailing hyphen",
      host: "team-.kaimono.app",
      expected: null,
    },
  ])("returns $expected for $caseName", ({ host, expected }) => {
    expect(
      extractSubdomainFromHost({
        host,
        rootDomainHost,
      }),
    ).toBe(expected);
  });
});
