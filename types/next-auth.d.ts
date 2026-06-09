import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    requiresTwoFactor?: boolean;
    twoFactorVerified?: boolean;
    twoFactorVerifiedAt?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    requiresTwoFactor?: boolean;
    twoFactorVerified?: boolean;
    twoFactorVerifiedAt?: string | null;
  }
}
