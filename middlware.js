// File: /middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const authToken = request.cookies.get("auth-token");

  if (!authToken && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
