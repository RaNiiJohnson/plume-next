import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const protectedRoutes = [
      "/workspace",
      "/board",
      "/invite",
      "/notifications",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Routes d'authentification (sign-in, sign-up)
    const authRoutes = ["/auth/signin", "/auth/signup"];
    const isAuthRoute = authRoutes.includes(pathname);

    // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
    if (!session && isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Si l'utilisateur est connecté et tente d'accéder aux pages d'authentification
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // En cas d'erreur, rediriger vers la page de connexion pour les routes protégées
    const protectedRoutes = [
      "/workspace",
      "/board",
      "/invite",
      "/notifications",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
