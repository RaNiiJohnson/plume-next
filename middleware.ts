// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Routes protégées qui nécessitent une authentification
//   const protectedRoutes = ["/workspace", "/board", "/invite", "/notifications"];
//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   // Routes d'authentification (sign-in, sign-up)
//   const authRoutes = ["/auth/signin", "/auth/signup"];
//   const isAuthRoute = authRoutes.includes(pathname);

//   // ✅ VALIDATION COMPLÈTE DE LA SESSION (pas juste le cookie)
//   let isAuthenticated = false;

//   try {
//     const session = await auth.api.getSession({
//       headers: request.headers,
//     });

//     isAuthenticated = !!(session?.session && session?.user);
//   } catch (error) {
//     console.log("Session validation failed:", error);
//     isAuthenticated = false;
//   }

//   // Routes protégées - rediriger si pas authentifié
//   if (!isAuthenticated && isProtectedRoute) {
//     const redirectUrl = new URL("/auth/signin", request.url);
//     redirectUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   // Pages d'auth - rediriger si déjà authentifié
//   if (isAuthenticated && isAuthRoute) {
//     const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
//     return NextResponse.redirect(new URL(callbackUrl || "/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   runtime: "nodejs",
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };
