import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// Route Handler: session inspection without ever exposing the bearer token.
export async function GET() {
  return NextResponse.json(
    { authenticated: !!(await cookies()).get("norte_token") },
    { headers: { "Cache-Control": "no-store" } },
  );
}
