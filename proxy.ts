import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Apply internationalization middleware first
  const response = intlMiddleware(request);

  return response;
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next assets (static/image chunks)
  // - favicon
  // - any path containing a file extension (prevents `/en/*.svg` 404s)
  matcher: ["/((?!api|_next/static|_next/image|_next/data|_vercel|favicon.ico|.*\\..*).*)"],
};
