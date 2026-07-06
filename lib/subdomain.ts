type ExtractSubdomainInput = {
  host: string;
  rootDomainHost: string;
};

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function normalizeHostname(host: string) {
  const trimmed = host.trim().toLowerCase();

  if (!trimmed) return "";

  if (trimmed.startsWith("[")) {
    const closingBracketIndex = trimmed.indexOf("]");
    return closingBracketIndex === -1
      ? trimmed
      : trimmed.slice(1, closingBracketIndex);
  }

  return trimmed.split(":")[0].replace(/\.$/, "");
}

function isValidSubdomain(subdomain: string) {
  return SUBDOMAIN_REGEX.test(subdomain);
}

export function extractSubdomainFromHost(
  input: ExtractSubdomainInput,
): string | null {
  const hostname = normalizeHostname(input.host);
  const rootDomainHost = normalizeHostname(input.rootDomainHost);

  if (!hostname || !rootDomainHost) {
    return null;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(/\.localhost$/, "");
    return isValidSubdomain(subdomain) ? subdomain : null;
  }

  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const subdomain = hostname.split("---")[0];
    return isValidSubdomain(subdomain) ? subdomain : null;
  }

  const isSubdomain =
    hostname !== rootDomainHost &&
    hostname !== `www.${rootDomainHost}` &&
    hostname.endsWith(`.${rootDomainHost}`);

  if (!isSubdomain) {
    return null;
  }

  const subdomain = hostname.replace(`.${rootDomainHost}`, "");
  return isValidSubdomain(subdomain) ? subdomain : null;
}
