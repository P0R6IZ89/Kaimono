import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    isDemo?: boolean;
    demoExpiresAt?: string | null;
    demoSubdomain?: string | null;
  }

  interface Session {
    requiresTwoFactor?: boolean;
    twoFactorVerified?: boolean;
    twoFactorVerifiedAt?: string | null;
    isDemo?: boolean;
    demoExpiresAt?: string | null;
    demoSubdomain?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    requiresTwoFactor?: boolean;
    twoFactorVerified?: boolean;
    twoFactorVerifiedAt?: string | null;
    isDemo?: boolean;
    demoExpiresAt?: string | null;
    demoSubdomain?: string | null;
  }
}
