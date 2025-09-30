import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ["/workspace", "/board", "/invite", "/notifications"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Routes d'authentification (sign-in, sign-up)
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Skip auth check for non-protected routes
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // ✅ VALIDATION COMPLÈTE DE LA SESSION
  let isAuthenticated = false;

  try {
    // Import auth dynamically to avoid Edge Runtime issues
    const { auth } = await import("./src/lib/auth");

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    isAuthenticated = !!(session?.session && session?.user);
  } catch (error) {
    console.error("Session validation failed:", error);
    isAuthenticated = false;
  }

  // Routes protégées - rediriger si pas authentifié
  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Pages d'auth - rediriger si déjà authentifié
  if (isAuthenticated && isAuthRoute) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    return NextResponse.redirect(new URL(callbackUrl || "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)",
  ],
};
