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
];

const AUTH_PAGES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
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
