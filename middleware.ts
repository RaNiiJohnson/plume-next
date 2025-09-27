import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  // Vérifier l'existence du cookie de session
  const sessionCookie = getSessionCookie(request);

  const { pathname } = request.nextUrl;

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ["/workspace", "/board", "/invite", "notifications"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Routes d'authentification (sign-in, sign-up)
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.includes(pathname);

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
};
