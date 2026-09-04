import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "aip_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/challenges",
  "/lab-units",
  "/proof-of-work",
  "/skills",
  "/tokens",
  "/office-hours",
  "/internships",
  "/mentors",
  "/reverse-placement",
  "/job-pitches",
  "/portfolio",
  "/profile",
  "/dual-grading",
  "/assessments",
  "/syllabus",
  "/faculty-portal",
  "/sabbaticals",
  "/mentor-slots",
  "/placements",
  "/heatmap",
  "/partners",
  "/analytics",
  "/sync",
  "/settings",
];

const AUTH_PAGES = ["/login", "/signup"];

function isTokenExpiredOrInvalid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);
    if (!payload.sub) return true;
    if (payload.exp && payload.exp * 1000 < Date.now()) return true;
    return false;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((prefix) => pathname.startsWith(prefix));

  // If a token exists but is expired or malformed, purge it immediately
  if (token && isTokenExpiredOrInvalid(token)) {
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    const res = NextResponse.next();
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  // Protected routes require a token
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If visiting /login or /signup with a valid token, only redirect to /dashboard
  // if the user did NOT arrive via an explicit redirect (e.g. from /dashboard)
  // or query parameter. This guarantees no redirect loops.
  if (isAuthPage && token && !request.nextUrl.searchParams.has("from")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, svgs, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
