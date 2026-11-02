import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const token = request.cookies.get("norte_token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const response = NextResponse.next();
  // Enforce secure attributes at the middleware boundary; Laravel remains the authority.
  response.cookies.set("norte_token", token.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
export const config = {
  matcher: ["/historial/:path*", "/confirmacion/:path*"],
};
