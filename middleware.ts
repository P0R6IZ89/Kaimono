import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { privateRoutes } from "./routes";

const baseUrl = "http://localhost:3000";
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isPivateRoute = privateRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.includes("/auth");
  const isApiRoute = nextUrl.pathname.includes("/api");

  if (isApiRoute) {
    return;
  }
  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(`${baseUrl}/dashboard`);
  }
  if (isAuthRoute && !isLoggedIn) {
    return;
  }
  if (!isLoggedIn && isPivateRoute) {
    return Response.redirect(`${baseUrl}/api/auth/signin`);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
