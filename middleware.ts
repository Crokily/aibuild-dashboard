import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/dashboard", "/upload"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Unauthenticated access to protected routes -> redirect to login page
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated access to login page -> redirect to home page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure matcher to run middleware on specific paths
export const config = {
  matcher: [
    // Match all paths except API routes, _next/static, _next/image, and favicon.ico
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

