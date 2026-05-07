import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/public.html",
    "/api/login",
    "/favicon.ico"
  ];

  const publicPrefixes = [
    "/images/",
    "/css/",
    "/js/",
    "/assets/"
  ];

  const isPublic =
    publicPaths.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    return NextResponse.next();
  }

  const session = request.cookies.get("otos_session")?.value;

  if (session && session === process.env.OTOS_SESSION_TOKEN) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/public.html", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next|api/login).*)"]
};
