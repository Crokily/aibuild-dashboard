import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // 获取当前会话
  const session = await auth();
  
  const { pathname } = request.nextUrl;
  
  // 受保护的路由
  const protectedPaths = ['/dashboard', '/upload'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // 如果访问受保护的路由但没有登录，重定向到登录页
  if (isProtectedPath && !session?.user) {
    const loginUrl = new URL('/login', request.url);
    // 保存原始请求的URL，登录后可以重定向回去
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 如果已登录用户访问登录页，重定向到首页
  if (pathname === '/login' && session?.user) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// 配置匹配器，只在特定路径上运行中间件
export const config = {
  matcher: [
    // 匹配所有路径，除了 API routes, _next/static, _next/image 和 favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
