import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // 受保护的路由
  const protectedPaths = ["/dashboard", "/upload"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // 未登录访问受保护路由 -> 重定向到登录页
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录访问登录页 -> 重定向到首页
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 配置匹配器，只在特定路径上运行中间件
export const config = {
  matcher: [
    // 匹配所有路径，除了 API routes, _next/static, _next/image 和 favicon.ico
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

